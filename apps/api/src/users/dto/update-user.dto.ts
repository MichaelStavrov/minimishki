import { PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';

/**
 * Тело PATCH /api/users/:id — все поля CreateUserDto, но необязательные.
 *
 * PartialType — фабрика классов, а не тип: она копирует метаданные валидации
 * родителя и добавляет к ним @IsOptional. Интерфейс с `?` здесь не годится —
 * ValidationPipe читает метаданные класса, а интерфейсы компилятор стирает.
 *
 * Поле password наследуется тоже: смена пароля идёт этим же запросом,
 * и сервис обязан прогнать его через argon2 (см. users.service.ts).
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
