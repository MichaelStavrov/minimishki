import { IsIn, IsOptional } from 'class-validator';

import { ROLE, type Role } from '@minimishki/shared';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

/**
 * Query-параметры GET /api/users: ?page=&pageSize=&role=
 *
 * Обычное наследование, без PartialType: метаданные class-validator идут
 * по цепочке прототипов сами. Фабрика нужна только там, где их меняют.
 */
export class ListUsersDto extends PaginationQueryDto {
  /** Фильтр по точному совпадению; опирается на @@index([role]) в схеме */
  @IsOptional()
  @IsIn(Object.values(ROLE), { message: 'недопустимая роль' })
  role?: Role;
}
