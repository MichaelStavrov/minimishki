/** Единственный набор редактируемых контактов и юридических ссылок сайта. */
export interface SiteSettingsDto {
  phone: string | null;
  email: string | null;
  address: string | null;
  workingHours: string | null;
  vkUrl: string | null;
  telegramUrl: string | null;
  whatsappUrl: string | null;
  legalName: string | null;
  inn: string | null;
  privacyPolicyUrl: string | null;
  cookiePolicyUrl: string | null;
  updatedAt: string;
}
