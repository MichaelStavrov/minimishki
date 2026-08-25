import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { parseBooleanQuery, trimQueryString } from '../../../common/query-transformers';

/**
 * Query-параметры административного GET /api/posts/admin.
 *
 * Пагинация наследуется из PaginationQueryDto:
 * page по умолчанию 1, pageSize — 20, максимальный pageSize — 100.
 */
export class ListPostsDto extends PaginationQueryDto {
  /** Поиск без учёта регистра по заголовку, анонсу или slug */
  @IsOptional()
  @Transform(({ value }) => trimQueryString(value))
  @IsString()
  @Matches(/\S/, { message: 'search не может быть пустой строкой' })
  @MaxLength(200, { message: 'search не может быть длиннее 200 символов' })
  search?: string;

  /** Если фильтр отсутствует, административный список показывает оба состояния */
  @IsOptional()
  @Transform(({ value }) => parseBooleanQuery(value))
  @IsBoolean({ message: 'isPublished должен быть true или false' })
  isPublished?: boolean;
}
