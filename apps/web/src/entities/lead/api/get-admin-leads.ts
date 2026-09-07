import type { LeadDto, Paginated } from '@minimishki/shared';

import { adminApiRequest } from '@/shared/api/admin';

export type AdminLeadsQuery = {
  page: number;
  pageSize: number;
  search?: string;
  status?: LeadDto['status'];
};

export async function getAdminLeads(query: AdminLeadsQuery): Promise<Paginated<LeadDto>> {
  const response = await adminApiRequest<Paginated<LeadDto>>('/leads', { query });

  if (response === undefined) {
    throw new Error('API вернул пустой ответ вместо списка заявок');
  }

  return response;
}

export async function getAdminLead(id: string): Promise<LeadDto> {
  const response = await adminApiRequest<LeadDto>(`/leads/${id}`);

  if (response === undefined) {
    throw new Error('API вернул пустой ответ вместо заявки');
  }

  return response;
}
