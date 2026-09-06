import { IsIn } from 'class-validator';

import { REVIEW_STATUS, type ReviewStatus } from '@minimishki/shared';

/** Модератор меняет только статус, исходный текст остаётся неизменным. */
export class UpdateReviewStatusDto {
  @IsIn(Object.values(REVIEW_STATUS), { message: 'недопустимый статус отзыва' })
  status: ReviewStatus;
}
