import { Transform } from 'class-transformer';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { trimQueryString } from '../../../common/query-transformers';

/** Query-параметр публичного GET /api/search. */
export class SearchQueryDto {
  @Transform(({ value }) => trimQueryString(value))
  @IsString()
  @Matches(/\S/, { message: 'query не может быть пустой строкой' })
  @MinLength(2, { message: 'query должен содержать минимум 2 символа' })
  @MaxLength(100, { message: 'query не может быть длиннее 100 символов' })
  query!: string;
}
