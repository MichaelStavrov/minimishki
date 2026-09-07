import type { LeadDto, LeadStatus } from '@minimishki/shared';

import { adminApiRequest } from '@/shared/api/admin';

export async function changeLeadStatus(id: string, status: LeadStatus): Promise<LeadDto> {
  const response = await adminApiRequest<LeadDto>(`/leads/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (response === undefined) {
    throw new Error('API вернул пустой ответ вместо обновлённой заявки');
  }

  return response;
}
