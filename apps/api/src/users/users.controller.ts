import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';

import type { Paginated, UserDto } from '@minimishki/shared';

import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

/**
 * Маршруты /api/users. Только HTTP: разбор запроса, коды ответов, делегирование.
 *
 * DTO импортируются обычным import, а не import type, и это принципиально:
 * emitDecoratorMetadata записывает ссылку на класс в design:paramtypes, оттуда её
 * читает ValidationPipe. Стёртый импорт оставил бы в метаданных Object — валидация
 * молча перестала бы работать, без единой ошибки при запуске.
 *
 * TODO (шаг 18): @Roles(ROLE.ADMIN) на все маршруты. До появления guard'ов
 * POST открыт всем и позволяет создать пользователя с ролью ADMIN.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  findAll(@Query() query: ListUsersDto): Promise<Paginated<UserDto>> {
    return this.users.findAll(query);
  }

  /** Литеральные маршруты вроде /users/me объявлять выше: :id перехватит любую строку */
  @Get(':id')
  findOne(@Param('id') id: string): Promise<UserDto> {
    return this.users.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.users.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<UserDto> {
    return this.users.update(id, dto);
  }

  /** Nest по умолчанию отдал бы 200 с пустым телом — по соглашению нужен 204 */
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): Promise<void> {
    return this.users.remove(id);
  }
}
