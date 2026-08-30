import { createApiRequest } from './create-api-request';
import { getApiUrl } from './get-api-url';

export { ApiError, ApiNetworkError, ApiResponseFormatError } from './api-error';
export type { ApiRequestOptions } from './create-api-request';
export type { QueryParams } from './query-params';

export const apiRequest = createApiRequest(
  getApiUrl(process.env.NEXT_PUBLIC_API_URL, 'NEXT_PUBLIC_API_URL'),
);
