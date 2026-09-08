import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { SiteSettingsDto } from '@minimishki/shared';

import { serialize } from '../../common/serialize';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';

const SITE_SETTINGS_ID = 1;

type SiteSettingsValues = Partial<
  Pick<
    Prisma.SiteSettingsUncheckedCreateInput,
    | 'phone'
    | 'email'
    | 'address'
    | 'workingHours'
    | 'vkUrl'
    | 'telegramUrl'
    | 'whatsappUrl'
    | 'legalName'
    | 'inn'
    | 'privacyPolicyUrl'
    | 'cookiePolicyUrl'
  >
>;

const SITE_SETTINGS_SELECT = {
  phone: true,
  email: true,
  address: true,
  workingHours: true,
  vkUrl: true,
  telegramUrl: true,
  whatsappUrl: true,
  legalName: true,
  inn: true,
  privacyPolicyUrl: true,
  cookiePolicyUrl: true,
  updatedAt: true,
} satisfies Prisma.SiteSettingsSelect;

/** Настройки представлены одной строкой с известным ключом: это исключает дубликаты. */
@Injectable()
export class SiteSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SiteSettingsDto> {
    const settings = await this.prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: { id: SITE_SETTINGS_ID },
      update: {},
      select: SITE_SETTINGS_SELECT,
    });

    return serialize(settings);
  }

  async update(dto: UpdateSiteSettingsDto): Promise<SiteSettingsDto> {
    const data = normalize(dto);
    const settings = await this.prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: { id: SITE_SETTINGS_ID, ...data },
      update: data,
      select: SITE_SETTINGS_SELECT,
    });

    return serialize(settings);
  }
}

/** Пустая строка из формы означает отсутствие значения, а не полезные данные. */
function normalize(dto: UpdateSiteSettingsDto): SiteSettingsValues {
  return {
    phone: normalizeValue(dto.phone),
    email: normalizeValue(dto.email),
    address: normalizeValue(dto.address),
    workingHours: normalizeValue(dto.workingHours),
    vkUrl: normalizeValue(dto.vkUrl),
    telegramUrl: normalizeValue(dto.telegramUrl),
    whatsappUrl: normalizeValue(dto.whatsappUrl),
    legalName: normalizeValue(dto.legalName),
    inn: normalizeValue(dto.inn),
    privacyPolicyUrl: normalizeValue(dto.privacyPolicyUrl),
    cookiePolicyUrl: normalizeValue(dto.cookiePolicyUrl),
  };
}

function normalizeValue(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return value.trim() || null;
}
