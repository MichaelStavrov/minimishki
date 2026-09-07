import type { AdminLeadDto, LeadStatusChangeDto, Paginated } from '@minimishki/shared';

import { adminApiRequest } from '@/shared/api/admin';

export type AdminLeadsQuery = {
  page: number;
  pageSize: number;
  search?: string;
  status?: AdminLeadDto['status'];
};

export async function getAdminLeads(query: AdminLeadsQuery): Promise<Paginated<AdminLeadDto>> {
  const response = await adminApiRequest<Paginated<AdminLeadDto>>('/leads', { query });

  if (response === undefined) {
    throw new Error('API вернул пустой ответ вместо списка заявок');
  }

  return response;
}

export async function getAdminLead(id: string): Promise<AdminLeadDto> {
  const response = await adminApiRequest<AdminLeadDto>(`/leads/${id}`);

  if (response === undefined) {
    throw new Error('API вернул пустой ответ вместо заявки');
  }

  return response;
}

export async function getAdminLeadStatusHistory(id: string): Promise<LeadStatusChangeDto[]> {
  const response = await adminApiRequest<LeadStatusChangeDto[]>(`/leads/${id}/status-history`);

  if (response === undefined) {
    throw new Error('API вернул пустой ответ вместо истории статусов');
  }

  return response;
}
