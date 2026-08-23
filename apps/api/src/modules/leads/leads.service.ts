import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { LEAD_STATUS, type LeadDto, type Paginated } from '@minimishki/shared';

import { normalizeNullableText } from '../../common/normalize-nullable-text';
import { toDomainError } from '../../common/prisma-error';
import { serialize } from '../../common/serialize';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsDto } from './dto/list-leads.dto';
import { UpdateLeadStatusDto } from './dto/update-lead-status.dto';
import { LEAD_DETAIL_SELECT, LEAD_SELECT } from './leads.select';

const LEAD_ERROR_MESSAGES = {
  unique: 'Не удалось сохранить заявку из-за конфликта данных',
  notFound: 'Заявка или выбранная услуга не найдена',
};

/**
 * Центр работает по московскому времени. Europe/Moscow сейчас использует
 * постоянное смещение UTC+03:00 без сезонного перевода часов.
 */
const MOSCOW_UTC_OFFSET = '+03:00';
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** Начало московского календарного дня, представленное как момент времени UTC */
function getMoscowDayStart(date: string): Date {
  return new Date(`${date}T00:00:00.000${MOSCOW_UTC_OFFSET}`);
}

/** Начало следующего московского дня — верхняя исключительная граница периода */
function getNextMoscowDayStart(date: string): Date {
  return new Date(getMoscowDayStart(date).getTime() + MILLISECONDS_PER_DAY);
}

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Публичная форма не управляет статусом заявки.
   * Каждое новое обращение явно сохраняется как NEW.
   */
  async create(dto: CreateLeadDto): Promise<LeadDto> {
    const serviceId =
      dto.serviceId === null || dto.serviceId === undefined ? null : dto.serviceId.trim();

    try {
      const data: Prisma.LeadCreateInput = {
        name: dto.name.trim(),
        phone: dto.phone.trim(),
        childName: normalizeNullableText(dto.childName),
        childAge: dto.childAge ?? null,
        comment: normalizeNullableText(dto.comment),
        status: LEAD_STATUS.NEW,
        service:
          serviceId === null
            ? undefined
            : {
                connect: { id: serviceId },
              },
      };

      const lead =
        serviceId === null
          ? await this.prisma.lead.create({
              data,
              select: LEAD_DETAIL_SELECT,
            })
          : await this.prisma.$transaction(async (transaction) => {
              await this.ensurePublicServiceExists(transaction, serviceId);

              return transaction.lead.create({
                data,
                select: LEAD_DETAIL_SELECT,
              });
            });

      return serialize(lead);
    } catch (error) {
      throw toDomainError(error, LEAD_ERROR_MESSAGES);
    }
  }

  /** Административный список доступен только через защищённый контроллер */
  async findAll({
    page,
    pageSize,
    search,
    status,
    serviceId,
    createdFrom,
    createdTo,
  }: ListLeadsDto): Promise<Paginated<LeadDto>> {
    if (createdFrom !== undefined && createdTo !== undefined && createdFrom > createdTo) {
      throw new BadRequestException('createdFrom не может быть позже createdTo');
    }

    const createdAt: Prisma.DateTimeFilter | undefined =
      createdFrom !== undefined || createdTo !== undefined
        ? {
            ...(createdFrom === undefined ? {} : { gte: getMoscowDayStart(createdFrom) }),
            ...(createdTo === undefined ? {} : { lt: getNextMoscowDayStart(createdTo) }),
          }
        : undefined;

    const where: Prisma.LeadWhereInput = {
      ...(status === undefined ? {} : { status }),
      ...(serviceId === undefined ? {} : { serviceId }),
      ...(createdAt === undefined ? {} : { createdAt }),
      ...(search === undefined
        ? {}
        : {
            OR: [
              {
                name: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                childName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                phone: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({
        where,
        select: LEAD_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      items: serialize(items),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: string): Promise<LeadDto> {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      select: LEAD_DETAIL_SELECT,
    });

    if (!lead) {
      throw new NotFoundException('Заявка не найдена');
    }

    return serialize(lead);
  }

  async updateStatus(id: string, dto: UpdateLeadStatusDto): Promise<LeadDto> {
    try {
      const lead = await this.prisma.lead.update({
        where: { id },
        data: {
          status: dto.status,
        },
        select: LEAD_DETAIL_SELECT,
      });

      return serialize(lead);
    } catch (error) {
      throw toDomainError(error, LEAD_ERROR_MESSAGES);
    }
  }

  /**
   * Для публичной формы недостаточно существования serviceId:
   * черновики и архивные услуги не должны принимать новые заявки.
   */
  private async ensurePublicServiceExists(
    transaction: Prisma.TransactionClient,
    serviceId: string,
  ): Promise<void> {
    /**
     * FOR UPDATE удерживает строку услуги до завершения создания заявки.
     * Архивирование не сможет вклиниться между этой проверкой и INSERT Lead.
     */
    const services = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id"
      FROM "Service"
      WHERE "id" = ${serviceId}
        AND "isPublished" = true
        AND "archivedAt" IS NULL
      FOR UPDATE
    `);

    if (services.length === 0) {
      throw new NotFoundException('Услуга не найдена');
    }
  }
}
