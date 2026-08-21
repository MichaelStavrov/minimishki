import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { JwtPayload } from '../auth.service';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

/**
 * Возвращает проверенную полезную нагрузку JWT из текущего запроса.
 *
 * Использовать только на защищённых маршрутах: без JwtAuthGuard поле user
 * не будет заполнено Passport.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return request.user;
  },
);
