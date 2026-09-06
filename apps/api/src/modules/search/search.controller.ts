import { Controller, Get, Query } from '@nestjs/common';

import type { SearchResponseDto } from '@minimishki/shared';

import { Public } from '../../auth/decorators/public.decorator';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchService } from './search.service';

/** Публичный поиск по опубликованным услугам и новостям. */
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Public()
  @Get()
  find(@Query() query: SearchQueryDto): Promise<SearchResponseDto> {
    return this.search.find(query.query);
  }
}
