import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

function parseBooleanQuery(value: unknown): unknown {
  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return value;
}

function trimQueryString(value: unknown): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

/**
 * Query-параметры административного GET /api/services/admin.
 *
 * Пагинация наследуется из общего PaginationQueryDto:
 * page по умолчанию 1, pageSize — 20, максимум — 100.
 */
export class ListServicesDto extends PaginationQueryDto {
  /** Поиск без учёта регистра по названию или slug */
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

  /**
   * По умолчанию архив скрыт. true добавляет архивные услуги к активным,
   * а не переключает список исключительно на архив.
   */
  @IsOptional()
  @Transform(({ value }) => parseBooleanQuery(value))
  @IsBoolean({ message: 'includeArchived должен быть true или false' })
  includeArchived: boolean = false;
}
