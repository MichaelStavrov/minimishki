import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_SESSION_COOKIE } from '@/shared/config/admin-session';

export function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin !== null && origin !== request.nextUrl.origin) {
    return NextResponse.json({ message: 'Недопустимый origin.' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: ADMIN_SESSION_COOKIE, value: '', maxAge: 0, path: '/' });

  return response;
}
