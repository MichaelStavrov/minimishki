import type { NextRequest } from 'next/server';

type SameOriginOptions = {
  allowMissingOrigin?: boolean;
};

/**
 * Caddy завершает HTTPS, а Next.js получает внутренний HTTP-запрос. Поэтому
 * request.nextUrl.origin в production не совпадает с Origin браузера без
 * учёта X-Forwarded-Proto, который добавляет доверенный reverse proxy.
 */
export function hasSameOrigin(
  request: NextRequest,
  { allowMissingOrigin = false }: SameOriginOptions = {},
): boolean {
  const origin = request.headers.get('origin');

  if (origin === null) {
    return allowMissingOrigin;
  }

  return origin === getPublicRequestOrigin(request);
}

function getPublicRequestOrigin(request: NextRequest): string {
  const forwardedProtocol = request.headers.get('x-forwarded-proto')?.split(',', 1)[0]?.trim();
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',', 1)[0]?.trim();

  if (
    (forwardedProtocol === 'http' || forwardedProtocol === 'https') &&
    forwardedHost !== undefined &&
    forwardedHost !== ''
  ) {
    return `${forwardedProtocol}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}
