import { IsIn } from 'class-validator';

import { LEAD_STATUS, type LeadStatus } from '@minimishki/shared';

/** Тело PATCH /api/leads/:id */
export class UpdateLeadStatusDto {
  @IsIn(Object.values(LEAD_STATUS), {
    message: 'недопустимый статус заявки',
  })
  status: LeadStatus;
}
