import type { ReviewStatus } from '../enums';

/** Безопасное для сайта представление опубликованного отзыва. */
export interface ReviewDto {
  id: string;
  name: string;
  rating: number | null;
  text: string;
  createdAt: string;
}

/** Карточка очереди модерации. Email доступен только сотрудникам центра. */
export interface ReviewAdminDto extends ReviewDto {
  email: string;
  status: ReviewStatus;
  consentedAt: string;
  updatedAt: string;
}
