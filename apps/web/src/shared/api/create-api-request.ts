import type { ApiErrorDto } from '@minimishki/shared';

import { ApiError, ApiNetworkError, ApiResponseFormatError } from './api-error';
import { appendQueryParams, type QueryParams } from './query-params';

export type ApiRequestOptions = RequestInit & {
  query?: QueryParams;
};

export type ApiRequest = <T>(path: string, options?: ApiRequestOptions) => Promise<T | undefined>;

/** Создаёт транспорт, привязанный к одному базовому адресу API. */
export function createApiRequest(apiUrl: string): ApiRequest {
  return async function apiRequest<T>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<T | undefined> {
    const { query, ...requestInit } = options;
    const url = createApiUrl(apiUrl, path);

    if (query) {
      appendQueryParams(url, query);
    }

    let response: Response;

    try {
      response = await fetch(url, requestInit);
    } catch (error: unknown) {
      if (isAbortError(error)) {
        throw error;
      }

      throw new ApiNetworkError(error);
    }

    if (response.status === 204) {
      return undefined;
    }

    const body = await readJson(response);

    if (!response.ok) {
      if (!isApiErrorDto(body)) {
        throw new ApiResponseFormatError(response.status);
      }

      throw new ApiError(body);
    }

    return body as T;
  };
}

function createApiUrl(apiUrl: string, path: string): URL {
  const url = new URL(apiUrl);
  const normalizedPath = path.replace(/^\/+/, '');

  url.pathname = `${url.pathname.replace(/\/+$/, '')}/${normalizedPath}`;

  return url;
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new ApiResponseFormatError(response.status);
  }
}

function isApiErrorDto(value: unknown): value is ApiErrorDto {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.statusCode === 'number' &&
    typeof value.error === 'string' &&
    (typeof value.message === 'string' || isStringArray(value.message))
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item: unknown) => typeof item === 'string');
}

function isAbortError(error: unknown): error is Error {
  return error instanceof Error && error.name === 'AbortError';
}
