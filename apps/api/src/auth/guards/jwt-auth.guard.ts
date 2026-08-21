import {
  type CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

import type { JwtPayload } from '../auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): ReturnType<CanActivate['canActivate']> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  /** Нормализует стандартный ответ Passport под общий контракт ApiErrorDto. */
  handleRequest<TUser = JwtPayload>(error: unknown, user: TUser | false | null | undefined): TUser {
    if (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Неизвестная ошибка Passport');
    }

    if (!user) {
      throw new UnauthorizedException('Требуется действительный токен');
    }

    return user;
  }
}
