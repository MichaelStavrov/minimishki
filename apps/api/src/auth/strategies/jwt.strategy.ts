import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import type { JwtPayload } from '../auth.service';
import type { AppConfig } from '../../config/configuration';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService<AppConfig, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt.secret', { infer: true }),
      algorithms: ['HS256'],
    });
  }

  /**
   * Passport вызывает метод только после успешной проверки подписи и срока JWT.
   *
   * Обращения к базе здесь намеренно нет: защищённые запросы остаются stateless.
   * Возвращённый payload Passport сохранит в request.user.
   */
  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
