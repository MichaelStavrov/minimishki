import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';

import { ROLE, type ServiceScheduleDto } from '@minimishki/shared';

import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateServiceScheduleDto } from './dto/create-service-schedule.dto';
import { UpdateServiceScheduleDto } from './dto/update-service-schedule.dto';
import { ServiceSchedulesService } from './service-schedules.service';

@Roles(ROLE.ADMIN)
@Controller('services')
export class ServiceSchedulesController {
  constructor(private readonly schedules: ServiceSchedulesService) {}

  @Post(':serviceId/schedules')
  create(
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateServiceScheduleDto,
  ): Promise<ServiceScheduleDto> {
    return this.schedules.create(serviceId, dto);
  }

  @Patch('schedules/:scheduleId')
  update(
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateServiceScheduleDto,
  ): Promise<ServiceScheduleDto> {
    return this.schedules.update(scheduleId, dto);
  }

  @Delete('schedules/:scheduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('scheduleId') scheduleId: string): Promise<void> {
    return this.schedules.remove(scheduleId);
  }
}
