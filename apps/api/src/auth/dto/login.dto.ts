import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

/** Тело POST /api/auth/login. */
export class LoginDto {
  @IsEmail({}, { message: 'email должен быть корректным адресом' })
  email: string;

  /**
   * Ограничения совпадают с CreateUserDto.
   *
   * Верхняя граница защищает ресурсоёмкую проверку Argon2 от передачи
   * заведомо огромной строки. Сам открытый пароль нигде не сохраняется.
   */
  @IsString()
  @MinLength(8, { message: 'пароль короче 8 символов' })
  @MaxLength(128, { message: 'пароль длиннее 128 символов' })
  password: string;
}
