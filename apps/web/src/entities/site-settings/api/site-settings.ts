import type { SiteSettingsDto } from '@minimishki/shared';

import { adminApiRequest } from '@/shared/api/admin';

export type SiteSettingsValues = Omit<SiteSettingsDto, 'updatedAt'>;

const jsonHeaders = { 'Content-Type': 'application/json' };

/** Получает единственный набор настроек, доступный главному менеджеру. */
export function getSiteSettings(): Promise<SiteSettingsDto> {
  return required(
    adminApiRequest<SiteSettingsDto>('/site-settings'),
    'Сервер вернул пустой ответ вместо настроек сайта.',
  );
}

/** Сохраняет изменённые контакты и внешние юридические ссылки. */
export function updateSiteSettings(values: SiteSettingsValues): Promise<SiteSettingsDto> {
  return required(
    adminApiRequest<SiteSettingsDto>('/site-settings', {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул сохранённые настройки сайта.',
  );
}

async function required<T>(promise: Promise<T | undefined>, errorMessage: string): Promise<T> {
  const response = await promise;
  if (response === undefined) throw new Error(errorMessage);
  return response;
}
