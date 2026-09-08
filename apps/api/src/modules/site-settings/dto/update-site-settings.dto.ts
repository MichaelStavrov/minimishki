import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

/** Тело PATCH /api/site-settings. Все поля необязательны для частичного сохранения формы. */
export class UpdateSiteSettingsDto {
  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  phone?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  workingHours?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_000)
  vkUrl?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_000)
  telegramUrl?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_000)
  whatsappUrl?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(300)
  legalName?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsString()
  @Matches(/^\d{10}(\d{2})?$/, { message: 'ИНН должен состоять из 10 или 12 цифр' })
  @MaxLength(20)
  inn?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_000)
  privacyPolicyUrl?: string | null;

  @Transform(normalizeOptionalString)
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2_000)
  cookiePolicyUrl?: string | null;
}

function normalizeOptionalString({ value }: { value: unknown }): unknown {
  return typeof value === 'string' ? value.trim() || null : value;
}
