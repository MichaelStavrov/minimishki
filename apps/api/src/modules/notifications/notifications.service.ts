import { Injectable } from '@nestjs/common';
import { NotificationChannel, NotificationKind, type Prisma } from '@prisma/client';

/** Создаёт задания в той же транзакции, что и новая заявка. */
@Injectable()
export class NotificationsService {
  async enqueueLeadCreated(
    transaction: Prisma.TransactionClient,
    leadId: string,
    parentEmail: string,
  ): Promise<void> {
    await transaction.notificationJob.createMany({
      data: [
        {
          leadId,
          channel: NotificationChannel.TELEGRAM,
          kind: NotificationKind.LEAD_CREATED_STAFF,
        },
        {
          leadId,
          channel: NotificationChannel.EMAIL,
          kind: NotificationKind.LEAD_CREATED_STAFF,
        },
        {
          leadId,
          channel: NotificationChannel.EMAIL,
          kind: NotificationKind.LEAD_CREATED_PARENT,
          recipient: parentEmail,
        },
      ],
    });
  }
}
