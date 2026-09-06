import 'server-only';

import type { PartyCategoryDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

export async function getPartyCategories(): Promise<PartyCategoryDto[]> {
  const categories = await apiRequest<PartyCategoryDto[]>('/party-categories', {
    next: { revalidate: 60 },
  });

  if (categories === undefined) throw new Error('API вернул пустой праздничный каталог');

  return categories;
}
