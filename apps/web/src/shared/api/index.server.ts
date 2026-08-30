import 'server-only';

import { createApiRequest } from './create-api-request';
import { getApiUrl } from './get-api-url';

export { ApiError, ApiNetworkError, ApiResponseFormatError } from './api-error';
export type { ApiRequestOptions } from './create-api-request';
export type { QueryParams } from './query-params';

export const apiRequest = createApiRequest(getApiUrl(process.env.API_URL, 'API_URL'));
