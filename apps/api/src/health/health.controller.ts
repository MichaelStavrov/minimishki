import { Controller, Get } from '@nestjs/common';

import type { HealthDto } from '@minimishki/shared';

import { Public } from '../auth/decorators/public.decorator';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** GET /api/health — публичная проверка доступности процесса и базы. */
  @Public()
  @Get()
  check(): Promise<HealthDto> {
    return this.health.check();
  }
}
