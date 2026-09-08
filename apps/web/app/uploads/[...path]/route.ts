import { NextRequest, NextResponse } from 'next/server';

import { getApiUrl } from '@/shared/api/get-api-url';

type Context = { params: Promise<{ path: string[] }> };

/** Отдаёт локальные файлы API через домен сайта, поэтому сохранённые относительные URL работают везде. */
export async function GET(_request: NextRequest, { params }: Context): Promise<NextResponse> {
  const { path } = await params;
  if (
    !path.length ||
    path.some((segment) => segment === '' || segment === '.' || segment === '..')
  ) {
    return NextResponse.json({ message: 'Недопустимый путь файла.' }, { status: 400 });
  }

  const apiUrl = new URL(getApiUrl(process.env.API_URL, 'API_URL'));
  const target = new URL(`/uploads/${path.map(encodeURIComponent).join('/')}`, apiUrl.origin);

  try {
    const response = await fetch(target, {
      cache: 'force-cache',
      signal: AbortSignal.timeout(5000),
    });
    return new NextResponse(response.body, {
      status: response.status,
      headers: copyHeaders(response),
    });
  } catch {
    return NextResponse.json({ message: 'Файл временно недоступен.' }, { status: 503 });
  }
}

function copyHeaders(response: Response): Headers {
  const headers = new Headers();
  for (const name of ['content-type', 'cache-control', 'etag', 'x-content-type-options']) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}
