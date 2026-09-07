import 'server-only';

import type { UserDto } from '@minimishki/shared';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { ADMIN_SESSION_COOKIE } from '@/shared/config/admin-session';

import { apiRequest } from './index.server';

/** Запрашивает профиль сотрудника, не раскрывая JWT в React-коде или браузере. */
export const getAdminSessionUser = cache(async (): Promise<UserDto | null> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  try {
    return (
      (await apiRequest<UserDto>('auth/me', {
        cache: 'no-store',
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(3000),
      })) ?? null
    );
  } catch {
    // Просроченный или отозванный токен не должен ронять рендер админки.
    return null;
  }
});
