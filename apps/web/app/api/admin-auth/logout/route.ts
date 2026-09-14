import { NextRequest, NextResponse } from 'next/server';

import { hasSameOrigin } from '@/shared/api/same-origin.server';
import { ADMIN_SESSION_COOKIE } from '@/shared/config/admin-session';

export function POST(request: NextRequest) {
  if (!hasSameOrigin(request, { allowMissingOrigin: true })) {
    return NextResponse.json({ message: 'Недопустимый origin.' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({ name: ADMIN_SESSION_COOKIE, value: '', maxAge: 0, path: '/' });

  return response;
}
