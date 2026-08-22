import { PartialType } from '@nestjs/mapped-types';

import { CreateServiceScheduleDto } from './create-service-schedule.dto';

/**
 * Тело PATCH /api/services/schedules/:scheduleId.
 *
 * serviceId не редактируется: перенос расписания между услугами не входит
 * в обычное обновление сущности.
 */
export class UpdateServiceScheduleDto extends PartialType(CreateServiceScheduleDto, {
  skipNullProperties: false,
}) {}
