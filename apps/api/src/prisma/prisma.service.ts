import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, PrismaClient } from '@prisma/client';

import type { AppConfig } from '../config/configuration';

/**
 * Единственный на всё приложение экземпляр PrismaClient.
 * Наследуется от клиента, поэтому в сервисах доступно this.prisma.user.findMany() и т.д.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<AppConfig, true>) {
    const log: Prisma.LogLevel[] = config.get('app.isProduction', { infer: true })
      ? ['warn', 'error']
      : ['query', 'warn', 'error'];

    super({
      datasourceUrl: config.get('database.url', { infer: true }),
      log,
    });
  }

  /** Подключение на старте: приложение не поднимется, если база недоступна. */
  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Подключение к базе установлено');
  }

  /** Корректное закрытие пула соединений при остановке приложения. */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
