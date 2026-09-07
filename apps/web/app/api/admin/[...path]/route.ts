import { NextRequest, NextResponse } from 'next/server';

import { getApiUrl } from '@/shared/api/get-api-url';
import { ADMIN_SESSION_COOKIE } from '@/shared/config/admin-session';

type Context = { params: Promise<{ path: string[] }> };

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function GET(request: NextRequest, context: Context) {
  return proxy(request, context);
}
export async function POST(request: NextRequest, context: Context) {
  return proxy(request, context);
}
export async function PATCH(request: NextRequest, context: Context) {
  return proxy(request, context);
}
export async function PUT(request: NextRequest, context: Context) {
  return proxy(request, context);
}
export async function DELETE(request: NextRequest, context: Context) {
  return proxy(request, context);
}

async function proxy(request: NextRequest, { params }: Context): Promise<NextResponse> {
  if (!SAFE_METHODS.has(request.method) && !hasSameOrigin(request)) {
    return NextResponse.json({ message: 'Недопустимый origin.' }, { status: 403 });
  }

  const accessToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ message: 'Требуется авторизация.' }, { status: 401 });
  }

  const { path } = await params;
  if (!isSafePath(path) || path.join('/') === 'auth/login') {
    return NextResponse.json({ message: 'Недопустимый путь API.' }, { status: 400 });
  }

  const target = new URL(getApiUrl(process.env.API_URL, 'API_URL'));
  target.pathname = `${target.pathname.replace(/\/$/, '')}/${path.map(encodeURIComponent).join('/')}`;
  target.search = request.nextUrl.search;

  const headers = new Headers({
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  });
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  let response: Response;

  try {
    response = await fetch(target, {
      method: request.method,
      headers,
      body: SAFE_METHODS.has(request.method) ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    return NextResponse.json(
      { message: 'Сервис админки временно недоступен. Попробуйте немного позже.' },
      { status: 503 },
    );
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('content-type') ?? 'application/json' },
  });
}

function hasSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  return origin === request.nextUrl.origin;
}

function isSafePath(path: string[]): boolean {
  return (
    path.length > 0 &&
    path.every((segment) => segment !== '' && segment !== '.' && segment !== '..')
  );
}
