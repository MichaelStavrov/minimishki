import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import type { Request } from 'express';

import { ROLE, type Paginated, type ReviewAdminDto, type ReviewDto } from '@minimishki/shared';

import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { ReviewsService } from './reviews.service';

/** Публичные отзывы и защищённая очередь их премодерации. */
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Public()
  @Get()
  findPublic(@Query() query: PaginationQueryDto): Promise<Paginated<ReviewDto>> {
    return this.reviews.findPublic(query);
  }

  @Public()
  @Post()
  create(@Body() dto: CreateReviewDto, @Req() request: Request): Promise<ReviewDto> {
    return this.reviews.create(dto, request.ip ?? request.socket.remoteAddress ?? 'unknown');
  }

  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Get('admin')
  findAllAdmin(@Query() query: ListReviewsDto): Promise<Paginated<ReviewAdminDto>> {
    return this.reviews.findAllAdmin(query);
  }

  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string): Promise<ReviewAdminDto> {
    return this.reviews.findOneAdmin(id);
  }

  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Patch('admin/:id')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReviewStatusDto,
  ): Promise<ReviewAdminDto> {
    return this.reviews.updateStatus(id, dto);
  }
}
