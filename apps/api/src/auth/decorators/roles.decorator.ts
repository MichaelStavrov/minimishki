import { SetMetadata } from '@nestjs/common';

import type { Role } from '@minimishki/shared';

/** Ключ метаданных, по которому RolesGuard получает разрешённые роли. */
export const ROLES_KEY = 'roles';

/**
 * Ограничивает доступ пользователями с одной из перечисленных ролей.
 *
 * Пример:
 * @Roles(ROLE.ADMIN, ROLE.MANAGER)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
