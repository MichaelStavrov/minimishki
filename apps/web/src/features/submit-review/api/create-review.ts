import type { ReviewDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api';

export type CreateReviewPayload = {
  name: string;
  email: string;
  rating: number | null;
  text: string;
  consent: true;
  website: string;
};

export async function createReview(payload: CreateReviewPayload): Promise<ReviewDto> {
  const review = await apiRequest<ReviewDto>('/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (review === undefined) throw new Error('API вернул пустой ответ вместо созданного отзыва');
  return review;
}
