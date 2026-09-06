import type { Paginated, ReviewDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

export async function getReviews(page: number): Promise<Paginated<ReviewDto>> {
  const reviews = await apiRequest<Paginated<ReviewDto>>('/reviews', {
    cache: 'no-store',
    query: { page, pageSize: 12 },
  });
  if (reviews === undefined) throw new Error('API вернул пустой ответ вместо списка отзывов');
  return reviews;
}
