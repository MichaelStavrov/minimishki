import type { Paginated, ServiceDto, TeacherDto } from '@minimishki/shared';

import { adminApiRequest } from '@/shared/api/admin';

export type AdminTeachersQuery = {
  page: number;
  pageSize: number;
  search?: string;
  isPublished?: boolean;
  includeArchived?: boolean;
};

export type TeacherValues = {
  slug: string;
  fullName: string;
  position: string;
  bio: string | null;
  photoUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  serviceIds: string[];
};

const jsonHeaders = { 'Content-Type': 'application/json' };

export function getAdminTeachers(query: AdminTeachersQuery): Promise<Paginated<TeacherDto>> {
  return required(
    adminApiRequest<Paginated<TeacherDto>>('/teachers/admin', { query }),
    'Сервер вернул пустой ответ вместо списка педагогов.',
  );
}

export function getAdminTeacher(id: string): Promise<TeacherDto> {
  return required(
    adminApiRequest<TeacherDto>(`/teachers/admin/${id}`),
    'Сервер вернул пустой ответ вместо педагога.',
  );
}

export function getTeacherServices(): Promise<ServiceDto[]> {
  return required(
    adminApiRequest<Paginated<ServiceDto>>('/services/admin', {
      query: { page: 1, pageSize: 100, includeArchived: true },
    }),
    'Сервер вернул пустой ответ вместо списка направлений.',
  ).then((response) => response.items);
}

export function createTeacher(values: TeacherValues): Promise<TeacherDto> {
  return required(
    adminApiRequest<TeacherDto>('/teachers', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул созданного педагога.',
  );
}

export function updateTeacher(id: string, values: Partial<TeacherValues>): Promise<TeacherDto> {
  return required(
    adminApiRequest<TeacherDto>(`/teachers/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул обновлённого педагога.',
  );
}

export async function archiveTeacher(id: string): Promise<void> {
  await adminApiRequest<void>(`/teachers/${id}`, { method: 'DELETE' });
}

export function restoreTeacher(id: string): Promise<TeacherDto> {
  return required(
    adminApiRequest<TeacherDto>(`/teachers/${id}/restore`, { method: 'POST' }),
    'Сервер не вернул восстановленного педагога.',
  );
}

async function required<T>(promise: Promise<T | undefined>, errorMessage: string): Promise<T> {
  const response = await promise;

  if (response === undefined) {
    throw new Error(errorMessage);
  }

  return response;
}
