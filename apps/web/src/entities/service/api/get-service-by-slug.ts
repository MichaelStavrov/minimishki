import 'server-only';

import type { ServiceDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

export async function getServiceBySlug(slug: string): Promise<ServiceDto> {
  const service = await apiRequest<ServiceDto>(`/services/${encodeURIComponent(slug)}`, {
    next: {
      revalidate: 60,
    },
  });

  if (service === undefined) {
    throw new Error('API вернул пустой ответ вместо услуги');
  }

  return service;
}
