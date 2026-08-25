import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ROLE, type Paginated, type PostDto } from '@minimishki/shared';

import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

/**
 * Маршруты /api/posts.
 *
 * Контроллер отвечает только за HTTP-контракт, доступ и делегирование.
 * Валидацию DTO выполняет глобальный ValidationPipe.
 */
@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Public()
  @Get()
  findPublic(@Query() query: PaginationQueryDto): Promise<Paginated<PostDto>> {
    return this.posts.findPublic(query);
  }

  /** Литеральные административные маршруты должны находиться выше динамического :slug */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Get('admin')
  findAllAdmin(@Query() query: ListPostsDto): Promise<Paginated<PostDto>> {
    return this.posts.findAllAdmin(query);
  }

  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string): Promise<PostDto> {
    return this.posts.findOneAdmin(id);
  }

  @Public()
  @Get(':slug')
  findPublicBySlug(@Param('slug') slug: string): Promise<PostDto> {
    return this.posts.findPublicBySlug(slug);
  }

  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Post()
  create(@Body() dto: CreatePostDto): Promise<PostDto> {
    return this.posts.create(dto);
  }

  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePostDto): Promise<PostDto> {
    return this.posts.update(id, dto);
  }

  /**
   * Удаление физическое, поэтому успешный ответ не содержит тела.
   * Связанные строки галереи удаляются каскадно на уровне PostgreSQL.
   */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.posts.remove(id);
  }
}
