import { Transform } from 'class-transformer';
import { IsDateString, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

import { LEAD_STATUS, type LeadStatus } from '@minimishki/shared';

import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { trimQueryString } from '../../../common/query-transformers';

/**
 * Query-параметры административного GET /api/leads.
 *
 * Пагинация наследуется из PaginationQueryDto:
 * page по умолчанию 1, pageSize — 20, максимальный pageSize — 100.
 */
export class ListLeadsDto extends PaginationQueryDto {
  /** Поиск без учёта регистра по имени родителя, ребёнка или телефону */
  @IsOptional()
  @Transform(({ value }) => trimQueryString(value))
  @IsString()
  @Matches(/\S/, { message: 'search не может быть пустой строкой' })
  @MaxLength(200, { message: 'search не может быть длиннее 200 символов' })
  search?: string;

  /** Если параметр отсутствует, список содержит заявки во всех статусах */
  @IsOptional()
  @IsIn(Object.values(LEAD_STATUS), {
    message: 'недопустимый статус заявки',
  })
  status?: LeadStatus;

  /** Фильтр по услуге, выбранной при создании заявки */
  @IsOptional()
  @Transform(({ value }) => trimQueryString(value))
  @IsString()
  @Matches(/\S/, { message: 'serviceId не может быть пустой строкой' })
  @MaxLength(100, { message: 'serviceId не может быть длиннее 100 символов' })
  serviceId?: string;

  /** Первый календарный день периода включительно */
  @IsOptional()
  @Transform(({ value }) => trimQueryString(value))
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'createdFrom должен иметь формат YYYY-MM-DD',
  })
  @IsDateString({ strict: true }, { message: 'createdFrom содержит недопустимую дату' })
  createdFrom?: string;

  /** Последний календарный день периода включительно */
  @IsOptional()
  @Transform(({ value }) => trimQueryString(value))
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'createdTo должен иметь формат YYYY-MM-DD',
  })
  @IsDateString({ strict: true }, { message: 'createdTo содержит недопустимую дату' })
  createdTo?: string;
}
