import type { LoginResponseDto } from '@minimishki/shared';
import { NextRequest, NextResponse } from 'next/server';

import { getApiUrl } from '@/shared/api/get-api-url';
import { ADMIN_SESSION_COOKIE } from '@/shared/config/admin-session';

export async function POST(request: NextRequest) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ message: 'Недопустимый origin.' }, { status: 403 });
  }

  let response: Response;

  try {
    response = await fetch(`${getApiUrl(process.env.API_URL, 'API_URL')}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: await request.text(),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return NextResponse.json(
      { message: 'Сервис авторизации временно недоступен. Попробуйте немного позже.' },
      { status: 503 },
    );
  }

  const body: unknown = await response.json().catch(() => undefined);

  if (!response.ok) {
    return NextResponse.json(body ?? { message: 'Не удалось войти.' }, { status: response.status });
  }

  if (!isLoginResponse(body)) {
    return NextResponse.json({ message: 'API вернул некорректный ответ.' }, { status: 502 });
  }

  const result = NextResponse.json({ ok: true });
  result.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: body.accessToken,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return result;
}

function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  return origin === null || origin === request.nextUrl.origin;
}

function isLoginResponse(value: unknown): value is LoginResponseDto {
  return (
    typeof value === 'object' &&
    value !== null &&
    'accessToken' in value &&
    typeof value.accessToken === 'string'
  );
}
