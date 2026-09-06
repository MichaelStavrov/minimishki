import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { PRICE_TYPE, type PriceType } from '@minimishki/shared';

export class CreatePartyItemDto {
  @IsString() @MaxLength(200) @Matches(/\S/) title: string;
  @IsOptional() @IsString() @MaxLength(100000) descriptionHtml?: string | null;
  @IsIn(Object.values(PRICE_TYPE)) priceType: PriceType;
  @IsOptional() @IsInt() @Min(1) @Max(2147483647) amount?: number | null;
  @IsOptional() @IsString() @MaxLength(100) priceUnit?: string | null;
  @IsOptional() @IsString() @MaxLength(500) priceNote?: string | null;
  @IsOptional() @IsInt() @Min(1) @Max(2147483647) durationMinutes?: number | null;
  @IsOptional() @IsString() @MaxLength(100) ageLabel?: string | null;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}
