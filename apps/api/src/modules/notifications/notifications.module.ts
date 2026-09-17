import { Module } from '@nestjs/common';

import { NotificationsProcessor } from './notifications.processor';
import { NotificationsService } from './notifications.service';
import { MaxWebhookController } from './max-webhook.controller';

@Module({
  controllers: [MaxWebhookController],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
