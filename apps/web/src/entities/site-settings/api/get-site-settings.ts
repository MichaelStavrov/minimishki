import type { SiteSettingsDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

/** Публичные настройки не кешируются: сохранение в админке видно посетителям сразу. */
export async function getPublicSiteSettings(): Promise<SiteSettingsDto> {
  const settings = await apiRequest<SiteSettingsDto>('/site-settings', { cache: 'no-store' });

  if (settings === undefined) {
    throw new Error('Сервер вернул пустой ответ вместо настроек сайта.');
  }

  return settings;
}
