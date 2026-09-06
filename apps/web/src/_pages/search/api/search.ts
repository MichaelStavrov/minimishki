import 'server-only';

import type { SearchResponseDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

export async function search(query: string): Promise<SearchResponseDto> {
  const response = await apiRequest<SearchResponseDto>('/search', {
    query: { query },
    next: { revalidate: 60 },
  });

  if (response === undefined) {
    throw new Error('API вернул пустой ответ вместо результатов поиска');
  }

  return response;
}
