import type { HealthDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

export function getHealth(): Promise<HealthDto | undefined> {
  return apiRequest<HealthDto>('/health', {
    cache: 'no-store',
  });
}
