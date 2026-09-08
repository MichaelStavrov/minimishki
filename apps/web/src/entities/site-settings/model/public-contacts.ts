import type { SiteSettingsDto } from '@minimishki/shared';

export type SocialLink = { label: string; href: string };

/** Делит многострочные значения из админки на читаемые строки без пустых абзацев. */
export function getLines(value: string | null): string[] {
  return (
    value
      ?.split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean) ?? []
  );
}

/** Телефон вводится в привычном формате, а href получает только цифры и ведущий +. */
export function getPhoneHref(phone: string | null): string | null {
  if (!phone) return null;

  const normalized = phone.replace(/[^\d+]/g, '');
  return normalized ? `tel:${normalized}` : null;
}

export function getSocialLinks(settings: SiteSettingsDto): SocialLink[] {
  return [
    { label: 'ВКонтакте', href: settings.vkUrl },
    { label: 'Telegram', href: settings.telegramUrl },
    { label: 'WhatsApp', href: settings.whatsappUrl },
  ].filter((link): link is SocialLink => link.href !== null);
}
