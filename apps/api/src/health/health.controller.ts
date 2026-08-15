import { Controller, Get } from '@nestjs/common';

import { HealthService, type HealthResponse } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  /** GET /api/health — жив ли процесс и доступна ли база. */
  @Get()
  check(): Promise<HealthResponse> {
    return this.health.check();
  }
}
