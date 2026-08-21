import { Controller, Get } from '@nestjs/common';

import { Public } from '../auth/decorators/public.decorator';
import { HealthService, type HealthResponse } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** GET /api/health — публичная проверка доступности процесса и базы. */
  @Public()
  @Get()
  check(): Promise<HealthResponse> {
    return this.health.check();
  }
}
