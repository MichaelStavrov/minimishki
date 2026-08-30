import type { ApiErrorDto } from '@minimishki/shared';

/** Ошибка API, вернувшего стандартный JSON-контракт Nest. */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly error: string;
  readonly apiMessage: ApiErrorDto['message'];

  constructor({ statusCode, error, message }: ApiErrorDto) {
    super(Array.isArray(message) ? message.join('; ') : message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.error = error;
    this.apiMessage = message;
  }
}

/** Ошибка транспорта: запрос не дошёл до API или ответ не удалось получить. */
export class ApiNetworkError extends Error {
  constructor(cause: unknown) {
    super('Не удалось подключиться к API.', { cause });

    this.name = 'ApiNetworkError';
  }
}

/** API ответил, но вернул формат, отличающийся от ожидаемого JSON. */
export class ApiResponseFormatError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number) {
    super(`API вернул ответ в неподдерживаемом формате (HTTP ${statusCode}).`);

    this.name = 'ApiResponseFormatError';
    this.statusCode = statusCode;
  }
}
