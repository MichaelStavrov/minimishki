import { IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { ROLE, type Role } from '@minimishki/shared';

/**
 * Тело POST /api/users.
 *
 * Описывает то, что присылает клиент, а не строку таблицы: приходит открытый
 * password, в базу уйдёт passwordHash. Открытый пароль дальше сервиса не живёт.
 */
export class CreateUserDto {
  @IsEmail({}, { message: 'email должен быть корректным адресом' })
  email: string;

  /**
   * Потолок 128 — не про стойкость, а про ресурсы: argon2 намеренно медленный
   * и требовательный к памяти, без границы огромная строка займёт процесс надолго.
   */
  @IsString()
  @MinLength(8, { message: 'пароль короче 8 символов' })
  @MaxLength(128, { message: 'пароль длиннее 128 символов' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'имя короче 2 символов' })
  @MaxLength(100, { message: 'имя длиннее 100 символов' })
  name: string;

  /**
   * Значения берутся из общего перечисления, а не переписаны строками: тот же
   * объект ROLE видит фронтенд, и расхождение поймает src/common/enum-parity.ts.
   * Поле не прислали — роль проставит база, у неё @default(USER).
   */
  @IsOptional()
  @IsIn(Object.values(ROLE), { message: 'недопустимая роль' })
  role?: Role;
}
