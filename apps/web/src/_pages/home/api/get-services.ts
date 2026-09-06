import type { Paginated, ServiceDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

export async function getServices(): Promise<Paginated<ServiceDto>> {
  const services = await apiRequest<Paginated<ServiceDto>>('/services', {
    query: {
      page: 1,
      pageSize: 3,
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
