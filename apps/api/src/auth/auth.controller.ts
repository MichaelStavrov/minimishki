import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import type { LoginResponseDto, UserDto } from '@minimishki/shared';

import { AuthService, type JwtPayload } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Выдаёт JWT после проверки email и пароля. */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  /**
   * Возвращает актуальные данные владельца JWT.
   *
   * @CurrentUser() получает проверенный payload из request.user,
   * а поиск по sub загружает свежие данные пользователя из базы.
   */
  @Get('me')
  getCurrentUser(@CurrentUser() user: JwtPayload): Promise<UserDto> {
    return this.authService.getCurrentUser(user.sub);
  }
}
