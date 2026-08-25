import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { parseBooleanQuery, trimQueryString } from '../../../common/query-transformers';

export const GALLERY_OWNER_TYPE = {
  GENERAL: 'GENERAL',
  POST: 'POST',
  SERVICE: 'SERVICE',
} as const;

export type GalleryOwnerType = (typeof GALLERY_OWNER_TYPE)[keyof typeof GALLERY_OWNER_TYPE];

/**
 * Query-параметры административного GET /api/gallery-items/admin.
 *
 * Пагинация наследуется из PaginationQueryDto:
 * page по умолчанию 1, pageSize — 20, максимальный pageSize — 100.
 */
export class ListGalleryItemsDto extends PaginationQueryDto {
  /** Поиск без учёта регистра по URL, alt-тексту или видимой подписи */
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
   * GENERAL — общая галерея без владельца;
   * POST — фотографии публикаций;
   * SERVICE — фотографии услуг.
   */
  @IsOptional()
  @Transform(({ value }) => trimQueryString(value))
  @IsIn(Object.values(GALLERY_OWNER_TYPE), {
    message: 'ownerType должен быть GENERAL, POST или SERVICE',
  })
  ownerType?: GalleryOwnerType;
}
