import type { AdminLeadDto } from '@minimishki/shared';

import { adminApiRequest } from '@/shared/api/admin';

export async function updateLeadManagerComment(
  id: string,
  managerComment: string | null,
): Promise<AdminLeadDto> {
  const response = await adminApiRequest<AdminLeadDto>(`/leads/${id}/manager-comment`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ managerComment }),
  });

  if (response === undefined) {
    throw new Error('API вернул пустой ответ вместо обновлённой заявки');
  }

  return response;
}
