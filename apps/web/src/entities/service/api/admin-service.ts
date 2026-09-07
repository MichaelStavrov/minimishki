import type {
  AgeMode,
  DayOfWeek,
  Paginated,
  PriceType,
  ScheduleType,
  ServiceDto,
  ServiceOfferDto,
  ServiceOfferGroupDto,
  ServiceScheduleDto,
  TeacherDto,
} from '@minimishki/shared';

import { adminApiRequest } from '@/shared/api/admin';

export type AdminServicesQuery = {
  page: number;
  pageSize: number;
  search?: string;
  isPublished?: boolean;
  includeArchived?: boolean;
};

export type ServiceValues = {
  slug: string;
  title: string;
  summary: string | null;
  contentHtml: string;
  ageFromMonths: number | null;
  ageToMonths: number | null;
  ageNote: string | null;
  coverUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
  sortOrder: number;
  teacherIds: string[];
};

export type OfferGroupValues = {
  title: string;
  descriptionHtml: string | null;
  isPublished: boolean;
  sortOrder: number;
};

export type OfferValues = {
  title: string;
  descriptionHtml: string | null;
  imageUrl: string | null;
  priceType: PriceType;
  amount: number | null;
  priceUnit: string | null;
  priceNote: string | null;
  durationMinutes: number | null;
  ageMode: AgeMode;
  ageFromMonths: number | null;
  ageToMonths: number | null;
  ageNote: string | null;
  isPublished: boolean;
  sortOrder: number;
};

export type ScheduleValues = {
  scheduleType: ScheduleType;
  daysOfWeek: DayOfWeek[];
  startTime: string | null;
  endTime: string | null;
  validFrom: string | null;
  validUntil: string | null;
  label: string | null;
  isPublished: boolean;
  sortOrder: number;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

export async function getAdminServices(query: AdminServicesQuery): Promise<Paginated<ServiceDto>> {
  return required(
    adminApiRequest<Paginated<ServiceDto>>('/services/admin', { query }),
    'Сервер вернул пустой ответ вместо списка направлений.',
  );
}

export async function getAdminService(id: string): Promise<ServiceDto> {
  return required(
    adminApiRequest<ServiceDto>(`/services/admin/${id}`),
    'Сервер вернул пустой ответ вместо направления.',
  );
}

export async function getAdminTeachers(): Promise<TeacherDto[]> {
  const response = await required(
    adminApiRequest<Paginated<TeacherDto>>('/teachers/admin', {
      query: { page: 1, pageSize: 100, includeArchived: false },
    }),
    'Сервер вернул пустой ответ вместо списка педагогов.',
  );

  return response.items;
}

export function createService(values: ServiceValues): Promise<ServiceDto> {
  return required(
    adminApiRequest<ServiceDto>('/services', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул созданное направление.',
  );
}

export function updateService(id: string, values: Partial<ServiceValues>): Promise<ServiceDto> {
  return required(
    adminApiRequest<ServiceDto>(`/services/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул обновлённое направление.',
  );
}

export async function archiveService(id: string): Promise<void> {
  await adminApiRequest<void>(`/services/${id}`, { method: 'DELETE' });
}

export function restoreService(id: string): Promise<ServiceDto> {
  return required(
    adminApiRequest<ServiceDto>(`/services/${id}/restore`, { method: 'POST' }),
    'Сервер не вернул восстановленное направление.',
  );
}

export function createOfferGroup(
  id: string,
  values: OfferGroupValues,
): Promise<ServiceOfferGroupDto> {
  return required(
    adminApiRequest<ServiceOfferGroupDto>(`/services/${id}/offer-groups`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул созданную группу предложений.',
  );
}

export function updateOfferGroup(
  id: string,
  values: OfferGroupValues,
): Promise<ServiceOfferGroupDto> {
  return required(
    adminApiRequest<ServiceOfferGroupDto>(`/services/offer-groups/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул обновлённую группу предложений.',
  );
}

export async function removeOfferGroup(id: string): Promise<void> {
  await adminApiRequest<void>(`/services/offer-groups/${id}`, { method: 'DELETE' });
}

export function createOffer(id: string, values: OfferValues): Promise<ServiceOfferDto> {
  return required(
    adminApiRequest<ServiceOfferDto>(`/services/offer-groups/${id}/offers`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул созданное предложение.',
  );
}

export function updateOffer(id: string, values: OfferValues): Promise<ServiceOfferDto> {
  return required(
    adminApiRequest<ServiceOfferDto>(`/services/offers/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул обновлённое предложение.',
  );
}

export async function removeOffer(id: string): Promise<void> {
  await adminApiRequest<void>(`/services/offers/${id}`, { method: 'DELETE' });
}

export function createSchedule(id: string, values: ScheduleValues): Promise<ServiceScheduleDto> {
  return required(
    adminApiRequest<ServiceScheduleDto>(`/services/${id}/schedules`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул созданное расписание.',
  );
}

export function updateSchedule(id: string, values: ScheduleValues): Promise<ServiceScheduleDto> {
  return required(
    adminApiRequest<ServiceScheduleDto>(`/services/schedules/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул обновлённое расписание.',
  );
}

export async function removeSchedule(id: string): Promise<void> {
  await adminApiRequest<void>(`/services/schedules/${id}`, { method: 'DELETE' });
}

async function required<T>(promise: Promise<T | undefined>, errorMessage?: string): Promise<T> {
  const response = await promise;

  if (response === undefined) {
    throw new Error(errorMessage ?? 'Сервер вернул пустой ответ.');
  }

  return response;
}
