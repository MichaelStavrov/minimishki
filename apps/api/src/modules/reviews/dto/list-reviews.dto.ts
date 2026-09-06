import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { REVIEW_STATUS, type ReviewStatus } from '@minimishki/shared';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { trimQueryString } from '../../../common/query-transformers';

/** Фильтры административной очереди отзывов. */
export class ListReviewsDto extends PaginationQueryDto {
  @IsOptional()
  @IsIn(Object.values(REVIEW_STATUS), { message: 'недопустимый статус отзыва' })
  status?: ReviewStatus;

  @IsOptional()
  @Transform(({ value }) => trimQueryString(value))
  @IsString()
  @Matches(/\S/, { message: 'search не может быть пустой строкой' })
  @MaxLength(200, { message: 'search не может быть длиннее 200 символов' })
  search?: string;
}
