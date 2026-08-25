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

import { ROLE, type GalleryItemDto, type Paginated } from '@minimishki/shared';

import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { ListGalleryItemsDto } from './dto/list-gallery-items.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { GalleryItemsService } from './gallery-items.service';

/**
 * Маршруты /api/gallery-items.
 *
 * Контроллер отвечает только за HTTP-контракт, права доступа и делегирование.
 * Валидацию DTO выполняет глобальный ValidationPipe.
 */
@Controller('gallery-items')
export class GalleryItemsController {
  constructor(private readonly galleryItems: GalleryItemsService) {}

  /** Публичная общая галерея */
  @Public()
  @Get()
  findPublic(@Query() query: PaginationQueryDto): Promise<Paginated<GalleryItemDto>> {
    return this.galleryItems.findPublic(query);
  }

  /** Литеральные административные маршруты объявлены выше динамического :id */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Get('admin')
  findAllAdmin(@Query() query: ListGalleryItemsDto): Promise<Paginated<GalleryItemDto>> {
    return this.galleryItems.findAllAdmin(query);
  }

  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string): Promise<GalleryItemDto> {
    return this.galleryItems.findOneAdmin(id);
  }

  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Post()
  create(@Body() dto: CreateGalleryItemDto): Promise<GalleryItemDto> {
    return this.galleryItems.create(dto);
  }

  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGalleryItemDto): Promise<GalleryItemDto> {
    return this.galleryItems.update(id, dto);
  }

  /**
   * Удаление физическое, поэтому успешный ответ не содержит тела.
   * Сам файл по сохранённому URL этот маршрут пока не удаляет.
   */
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.galleryItems.remove(id);
  }
}
