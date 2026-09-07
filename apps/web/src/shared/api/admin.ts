import { createApiRequest } from './create-api-request';

/**
 * Браузер обращается только к same-origin BFF. JWT остаётся в HttpOnly-cookie
 * и добавляется Route Handler-ом уже на сервере Next.js.
 */
export const adminApiRequest = createApiRequest('/api/admin');
