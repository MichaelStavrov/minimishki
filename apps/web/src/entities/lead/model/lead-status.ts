import { LEAD_STATUS, type LeadStatus } from '@minimishki/shared';

export const leadStatusLabels: Record<LeadStatus, string> = {
  [LEAD_STATUS.NEW]: 'Новая',
  [LEAD_STATUS.IN_PROGRESS]: 'В работе',
  [LEAD_STATUS.CONFIRMED]: 'Подтверждена',
  [LEAD_STATUS.REJECTED]: 'Отклонена',
};

export const leadStatusOptions = Object.values(LEAD_STATUS);
