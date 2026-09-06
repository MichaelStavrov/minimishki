import 'server-only';

import type { Paginated, ServiceDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

const CATALOG_PAGE_SIZE = 12;

export async function getServices(page = 1): Promise<Paginated<ServiceDto>> {
  const services = await apiRequest<Paginated<ServiceDto>>('/services', {
    query: {
      page,
      pageSize: CATALOG_PAGE_SIZE,
    },
    next: {
      revalidate: 60,
    },
  });

  if (services === undefined) {
    throw new Error('API вернул пустой ответ вместо каталога услуг');
  }

  return services;
}
