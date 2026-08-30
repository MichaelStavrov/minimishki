import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import type { HealthDto } from '@minimishki/shared';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Состояние приложения. Бросает ServiceUnavailableException,
   * если база не отвечает — Nest превратит его в 503.
   */
  async check(): Promise<HealthDto> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException('База данных недоступна');
    }

    return {
      status: 'ok',
      database: 'up',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
