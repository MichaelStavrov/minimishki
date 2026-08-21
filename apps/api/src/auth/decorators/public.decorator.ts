import { SetMetadata } from '@nestjs/common';

/** Ключ метаданных, по которому JwtAuthGuard распознаёт публичные маршруты. */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Разрешает обращаться к маршруту без JWT.
 *
 * Используется только как явное исключение из правила
 * «все маршруты закрыты по умолчанию».
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
