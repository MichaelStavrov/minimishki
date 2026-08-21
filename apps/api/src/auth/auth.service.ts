import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import type { LoginResponseDto, Role, UserDto } from '@minimishki/shared';

import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';

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
   * Проверяет пару email/пароль и возвращает только безопасные поля.
   *
   * Для отсутствующего пользователя и неверного пароля используется одно сообщение:
   * клиент не должен узнавать, зарегистрирован ли конкретный email.
   */
  private async validateUser(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.usersService.findByEmailWithHash(email);

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const passwordMatches = await argon2.verify(user.passwordHash, password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
