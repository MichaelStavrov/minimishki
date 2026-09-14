import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NotificationChannel, NotificationKind, NotificationStatus, Prisma } from '@prisma/client';
import nodemailer, { type Transporter } from 'nodemailer';
import { createHash } from 'node:crypto';

import type { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../prisma/prisma.service';
import {
  NOTIFICATION_BATCH_SIZE,
  NOTIFICATION_LOCK_TIMEOUT_MS,
  NOTIFICATION_MAX_ATTEMPTS,
  NOTIFICATION_POLL_INTERVAL_MS,
  NOTIFICATION_RETRY_DELAYS_MS,
} from './notifications.constants';

type ClaimedNotificationJob = {
  id: string;
  lockedAt: Date;
};

type NotificationJobWithLead = Prisma.NotificationJobGetPayload<{
  include: {
    lead: {
      include: {
        service: {
          select: {
            title: true;
          };
        };
      };
    };
  };
}>;

/**
 * Обрабатывает outbox внутри API-процесса. Блокировка строки через SKIP LOCKED
 * позволяет безопасно запустить несколько экземпляров API позже.
 */
@Injectable()
export class NotificationsProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private interval: NodeJS.Timeout | undefined;
  private isProcessing = false;
  private transporter: Transporter | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  onModuleInit(): void {
    void this.processDueJobs();
    this.interval = setInterval(() => void this.processDueJobs(), NOTIFICATION_POLL_INTERVAL_MS);
  }

  onModuleDestroy(): void {
    if (this.interval !== undefined) {
      clearInterval(this.interval);
    }
  }

  private async processDueJobs(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const claimedJobs = await this.claimDueJobs();

      for (const claimedJob of claimedJobs) {
        await this.processJob(claimedJob);
      }
    } catch (error) {
      this.logger.error(`Не удалось получить задания уведомлений: ${getErrorMessage(error)}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async claimDueJobs(): Promise<ClaimedNotificationJob[]> {
    const lockTimeoutSeconds = Math.floor(NOTIFICATION_LOCK_TIMEOUT_MS / 1000);

    return this.prisma.$queryRaw<ClaimedNotificationJob[]>(Prisma.sql`
      WITH claimed AS (
        SELECT "id"
        FROM "NotificationJob"
        WHERE (
          "status" = ${NotificationStatus.PENDING}
          AND "nextAttemptAt" <= NOW()
        ) OR (
          "status" = ${NotificationStatus.PROCESSING}
          AND "lockedAt" < NOW() - (${lockTimeoutSeconds} * INTERVAL '1 second')
        )
        ORDER BY "nextAttemptAt" ASC, "id" ASC
        LIMIT ${NOTIFICATION_BATCH_SIZE}
        FOR UPDATE SKIP LOCKED
      )
      UPDATE "NotificationJob"
      SET
        "status" = ${NotificationStatus.PROCESSING},
        "lockedAt" = NOW(),
        "attempts" = "attempts" + 1,
        "updatedAt" = NOW()
      FROM claimed
      WHERE "NotificationJob"."id" = claimed."id"
      RETURNING "NotificationJob"."id", "NotificationJob"."lockedAt"
    `);
  }

  private async processJob(claimedJob: ClaimedNotificationJob): Promise<void> {
    const job = await this.prisma.notificationJob.findUnique({
      where: { id: claimedJob.id },
      include: {
        lead: {
          include: {
            service: {
              select: { title: true },
            },
          },
        },
      },
    });

    if (!job) {
      this.logger.warn(`Задание уведомления ${claimedJob.id} исчезло до обработки`);
      return;
    }

    try {
      await this.send(job);
      await this.markSent(claimedJob);
    } catch (error) {
      await this.markFailure(claimedJob, job.attempts, error);
    }
  }

  private async send(job: NotificationJobWithLead): Promise<void> {
    if (job.channel === NotificationChannel.VK) {
      await this.sendVk(job);
      return;
    }

    await this.sendEmail(job);
  }

  private async sendVk(job: NotificationJobWithLead): Promise<void> {
    if (job.kind !== NotificationKind.LEAD_CREATED_STAFF) {
      throw new Error('VK-автоответ родителю не поддерживается');
    }

    const token = this.config.get('notifications.vkCommunityToken', { infer: true });
    const peerId = this.config.get('notifications.vkChatPeerId', { infer: true });

    if (!token || !peerId) {
      throw new Error('VK-уведомления не настроены');
    }

    const body = new URLSearchParams({
      access_token: token,
      message: createStaffMessage(job),
      peer_id: peerId.toString(),
      random_id: createVkRandomId(job.id),
      v: '5.199',
    });

    const response = await fetch('https://api.vk.com/method/messages.send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new Error(`VK API вернул HTTP ${response.status}`);
    }

    const responseBody: unknown = await response.json();
    if (!isVkSuccess(responseBody)) {
      throw new Error(getVkErrorMessage(responseBody));
    }
  }

  private async sendEmail(job: NotificationJobWithLead): Promise<void> {
    const from = this.config.get('notifications.smtpFrom', { infer: true });
    if (!from) {
      throw new Error('SMTP-уведомления не настроены');
    }

    const recipient =
      job.kind === NotificationKind.LEAD_CREATED_STAFF
        ? this.config.get('notifications.staffEmail', { infer: true })
        : job.recipient;

    if (!recipient) {
      throw new Error('Не указан получатель email-уведомления');
    }

    const transporter = this.getTransporter();
    const isStaffNotification = job.kind === NotificationKind.LEAD_CREATED_STAFF;

    await transporter.sendMail({
      from,
      to: recipient,
      subject: isStaffNotification ? 'Новая заявка с сайта «Минимишки»' : 'Заявка принята',
      text: isStaffNotification ? createStaffMessage(job) : createParentMessage(job.lead.name),
    });
  }

  private getTransporter(): Transporter {
    if (this.transporter) return this.transporter;

    const host = this.config.get('notifications.smtpHost', { infer: true });
    const port = this.config.get('notifications.smtpPort', { infer: true });
    const user = this.config.get('notifications.smtpUser', { infer: true });
    const password = this.config.get('notifications.smtpPassword', { infer: true });

    if (!host || !port || !user || !password) {
      throw new Error('SMTP-уведомления не настроены');
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass: password },
    });

    return this.transporter;
  }

  private async markSent(claimedJob: ClaimedNotificationJob): Promise<void> {
    const result = await this.prisma.notificationJob.updateMany({
      where: {
        id: claimedJob.id,
        status: NotificationStatus.PROCESSING,
        lockedAt: claimedJob.lockedAt,
      },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        lockedAt: null,
        lastError: null,
      },
    });

    if (result.count === 0) {
      this.logger.warn(
        `Результат отправки задания ${claimedJob.id} не сохранён: блокировка устарела`,
      );
    }
  }

  private async markFailure(
    claimedJob: ClaimedNotificationJob,
    attempts: number,
    error: unknown,
  ): Promise<void> {
    const lastError = getErrorMessage(error).slice(0, 1000);
    const exhausted = attempts >= NOTIFICATION_MAX_ATTEMPTS;
    const retryDelay = NOTIFICATION_RETRY_DELAYS_MS[Math.min(attempts - 1, 3)];

    const result = await this.prisma.notificationJob.updateMany({
      where: {
        id: claimedJob.id,
        status: NotificationStatus.PROCESSING,
        lockedAt: claimedJob.lockedAt,
      },
      data: exhausted
        ? {
            status: NotificationStatus.FAILED,
            lockedAt: null,
            failedAt: new Date(),
            lastError,
          }
        : {
            status: NotificationStatus.PENDING,
            lockedAt: null,
            nextAttemptAt: new Date(Date.now() + retryDelay),
            lastError,
          },
    });

    if (result.count === 0) return;

    const state = exhausted ? 'окончательно не доставлено' : 'будет повторено';
    this.logger.error(`Уведомление ${claimedJob.id} ${state}: ${lastError}`);
  }
}

function createStaffMessage(job: NotificationJobWithLead): string {
  const { lead } = job;
  const child = lead.childName
    ? `${lead.childName}${lead.childAge === null ? '' : `, ${lead.childAge} лет`}`
    : 'не указано';

  return [
    'Новая заявка с сайта «Минимишки»',
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Email: ${lead.email ?? 'не указан'}`,
    `Ребёнок: ${child}`,
    `Направление: ${lead.service?.title ?? 'помогите выбрать'}`,
    `Комментарий: ${lead.comment ?? 'нет'}`,
  ].join('\n');
}

function createParentMessage(name: string): string {
  return [
    `Здравствуйте, ${name}!`,
    '',
    'Ваша заявка в детский центр «Минимишки» принята.',
    'Мы свяжемся с вами в течение дня и поможем выбрать подходящий формат.',
  ].join('\n');
}

function createVkRandomId(jobId: string): string {
  const firstEightBytes = createHash('sha256').update(jobId).digest().readBigUInt64BE();
  const positiveInt64 = firstEightBytes & 0x7fff_ffff_ffff_ffffn;

  return positiveInt64.toString();
}

function isVkSuccess(value: unknown): value is { response: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'response' in value &&
    typeof value.response === 'number'
  );
}

function getVkErrorMessage(value: unknown): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof value.error === 'object' &&
    value.error !== null &&
    'error_code' in value.error &&
    'error_msg' in value.error &&
    typeof value.error.error_code === 'number' &&
    typeof value.error.error_msg === 'string'
  ) {
    return `VK API: ${value.error.error_code} — ${value.error.error_msg}`;
  }

  return 'VK API не подтвердил отправку сообщения';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Неизвестная ошибка отправки';
}
