import type { LeadDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api';

export type CreateLeadPayload = {
  name: string;
  phone: string;
  childName: string | null;
  childAge: number | null;
  comment: string | null;
  serviceId: string | null;
};

export async function createLead(payload: CreateLeadPayload): Promise<LeadDto> {
  const lead = await apiRequest<LeadDto>('/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (lead === undefined) {
    throw new Error('API вернул пустой ответ вместо созданной заявки');
  }

  return lead;
}
