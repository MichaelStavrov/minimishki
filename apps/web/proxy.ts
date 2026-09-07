import { NextRequest, NextResponse } from 'next/server';

import { ADMIN_SESSION_COOKIE } from '@/shared/config/admin-session';

/** Быстро отсеивает неавторизованные запросы до рендера защищённого маршрута. */
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (request.cookies.has(ADMIN_SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const loginUrl = new URL('/admin/login', request.url);
  loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = { matcher: ['/admin/:path*'] };
