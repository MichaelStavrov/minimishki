import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Req,
  type RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { z } from 'zod';

import { Public } from '../../auth/decorators/public.decorator';
import type { AppConfig } from '../../config/configuration';

const maxUpdateSchema = z.object({
  update_type: z.enum(['bot_added', 'user_added']),
});

/** Принимает подписанные MAX-события, необходимые для получения chat_id рабочего чата. */
@Public()
@Controller('max')
export class MaxWebhookController {
  private readonly logger = new Logger(MaxWebhookController.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  receiveUpdate(
    @Headers('x-max-bot-api-secret') receivedSecret: string | undefined,
    @Body() body: unknown,
    @Req() request: RawBodyRequest<Request>,
  ): void {
    const expectedSecret = this.config.get('notifications.maxWebhookSecret', { infer: true });

    if (!expectedSecret || !receivedSecret || !isMatchingSecret(expectedSecret, receivedSecret)) {
      throw new UnauthorizedException('Недопустимый секрет Webhook MAX');
    }

    const update = maxUpdateSchema.safeParse(body);
    const chatId = getMaxChatId(request.rawBody);
    if (!update.success || !chatId) {
      return;
    }

    // В лог выводится только технический ID, без состава чата и персональных данных.
    this.logger.log(`MAX: ${update.data.update_type}, MAX_CHAT_ID=${chatId}`);
  }
}

/**
 * JSON-число chat_id имеет тип int64. Извлекаем его из исходного тела запроса,
 * чтобы JavaScript не потерял точность для значений больше Number.MAX_SAFE_INTEGER.
 */
function getMaxChatId(rawBody: Buffer | undefined): string | undefined {
  const match = rawBody?.toString('utf8').match(/"chat_id"\s*:\s*(\d+)/);
  return match?.[1];
}

function isMatchingSecret(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}
