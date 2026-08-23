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

import { ROLE, type Paginated, type TeacherDto } from '@minimishki/shared';

import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { ListTeachersDto } from './dto/list-teachers.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersService } from './teachers.service';

/**
 * Маршруты /api/teachers.
 *
 * Контроллер работает только с HTTP: получает параметры и делегирует сервису.
 * Валидация DTO выполняется глобальным ValidationPipe до входа в методы.
 */
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachers: TeachersService) {}

  @Public()
  @Get()
  findPublic(@Query() query: PaginationQueryDto): Promise<Paginated<TeacherDto>> {
    return this.teachers.findPublic(query);
  }

  /** Административные литеральные маршруты должны находиться выше динамического :slug */
  @Roles(ROLE.ADMIN)
  @Get('admin')
  findAllAdmin(@Query() query: ListTeachersDto): Promise<Paginated<TeacherDto>> {
    return this.teachers.findAllAdmin(query);
  }

  @Roles(ROLE.ADMIN)
  @Get('admin/:id')
  findOneAdmin(@Param('id') id: string): Promise<TeacherDto> {
    return this.teachers.findOneAdmin(id);
  }

  @Public()
  @Get(':slug')
  findPublicBySlug(@Param('slug') slug: string): Promise<TeacherDto> {
    return this.teachers.findPublicBySlug(slug);
  }

  @Roles(ROLE.ADMIN)
  @Post()
  create(@Body() dto: CreateTeacherDto): Promise<TeacherDto> {
    return this.teachers.create(dto);
  }

  @Roles(ROLE.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto): Promise<TeacherDto> {
    return this.teachers.update(id, dto);
  }

  /**
   * DELETE архивирует педагога, но контракт остаётся обычным удалением ресурса.
   * Успешный ответ не содержит тела.
   */
  @Roles(ROLE.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  archive(@Param('id') id: string): Promise<void> {
    return this.teachers.archive(id);
  }

  /**
   * Восстановление — действие над существующим ресурсом, поэтому возвращаем 200,
   * а не стандартный для POST код 201.
   */
  @Roles(ROLE.ADMIN)
  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  restore(@Param('id') id: string): Promise<TeacherDto> {
    return this.teachers.restore(id);
  }
}
