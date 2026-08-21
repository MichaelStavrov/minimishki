import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import type { LoginResponseDto } from '@minimishki/shared';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * На шаге 18 маршрут получит @Public(), когда появится глобальный JwtAuthGuard.
   * До установки глобального guard все маршруты пока доступны без токена.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }
}
