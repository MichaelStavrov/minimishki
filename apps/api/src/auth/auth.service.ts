import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import type { LoginResponseDto, Role, UserDto } from '@minimishki/shared';

import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

/**
 * Валидный Argon2-хеш несуществующего пароля.
 *
 * Нужен только для одинаковой стоимости неуспешного входа: неизвестный email
 * тоже проходит через argon2.verify, поэтому наличие аккаунта нельзя определить
 * по заметной разнице во времени ответа. Это не пароль и не секрет.
 */
const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,p=4,t=3$cEXxBPBdJToacpXsFZPrag$vMaFJkJPBy2NHpyxShRhK4vIeWnzck18V4VkCUU5r5E';

/**
 * Полезная нагрузка JWT.
 *
 * sub — стандартное поле subject: идентификатор того, кому выдан токен.
 * email и role нужны приложению без дополнительного запроса к базе.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/**
 * Проверенный пользователь без passwordHash.
 *
 * Полный UserDto здесь не нужен: для создания токена достаточно трёх полей.
 */
type AuthenticatedUser = Pick<UserDto, 'id' | 'email' | 'role'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(dto.email, dto.password);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  /**
   * Возвращает актуальные данные пользователя из базы.
   *
   * В отличие от проверки каждого защищённого запроса, отдельный /auth/me
   * намеренно обращается к PostgreSQL: клиенту нужны свежие имя, email и роль.
   */
  getCurrentUser(userId: string): Promise<UserDto> {
    return this.usersService.findOne(userId);
  }

  /**
   * Проверяет пару email/пароль и возвращает только безопасные поля.
   *
   * Для отсутствующего пользователя и неверного пароля используется одно сообщение:
   * клиент не должен узнавать, зарегистрирован ли конкретный email.
   */
  private async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.findByEmailWithHash(email);

    const passwordMatches = await argon2.verify(
      user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      password,
    );

    if (!user || !passwordMatches) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
