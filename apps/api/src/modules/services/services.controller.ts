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

import { ROLE, type Paginated, type ServiceDto } from '@minimishki/shared';

import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListServicesDto } from './dto/list-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

/**
 * Маршруты /api/services.
 *
 * Контроллер работает только с HTTP: получает параметры и делегирует сервису.
 * Валидация DTO выполняется глобальным ValidationPipe до входа в методы.
 */
@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) {}

  @Public()
  @Get()
  findPublic(@Query() query: PaginationQueryDto): Promise<Paginated<ServiceDto>> {
    return this.services.findPublic(query);
  }

  /** Административные литеральные маршруты должны находиться выше динамического :slug */
  @Roles(ROLE.ADMIN)
  @Get('admin')
  findAllAdmin(@Query() query: ListServicesDto): Promise<Paginated<ServiceDto>> {
    return this.services.findAllAdmin(query);
  }

  @Roles(ROLE.ADMIN)
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string): Promise<ServiceDto> {
    return this.services.findOneAdmin(id);
  }

  @Public()
  @Get(':slug')
  findPublicBySlug(@Param('slug') slug: string): Promise<ServiceDto> {
    return this.services.findPublicBySlug(slug);
  }

  @Roles(ROLE.ADMIN)
  @Post()
  create(@Body() dto: CreateServiceDto): Promise<ServiceDto> {
    return this.services.create(dto);
  }

  @Roles(ROLE.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateServiceDto): Promise<ServiceDto> {
    return this.services.update(id, dto);
  }

  /**
   * DELETE архивирует услугу, но контракт остаётся обычным удалением ресурса.
   * Успешный ответ не содержит тела.
   */
  @Roles(ROLE.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  archive(@Param('id') id: string): Promise<void> {
    return this.services.archive(id);
  }

  /**
   * Восстановление — действие над существующим ресурсом, поэтому возвращаем 200,
   * а не стандартный для POST код 201.
   */
  @Roles(ROLE.ADMIN)
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  restore(@Param('id') id: string): Promise<ServiceDto> {
    return this.services.restore(id);
  }
}
