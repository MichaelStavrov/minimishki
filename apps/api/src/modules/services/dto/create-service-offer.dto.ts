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
  ValidateIf,
} from 'class-validator';

import { AGE_MODE, PRICE_TYPE, type AgeMode, type PriceType } from '@minimishki/shared';

/**
 * Тело POST /api/services/offer-groups/:groupId/offers.
 *
 * groupId определяется параметром маршрута. Предложение нельзя переносить
 * между группами обычным PATCH-запросом.
 */
export class CreateServiceOfferDto {
  @IsString()
  @MaxLength(200, { message: 'название предложения не может быть длиннее 200 символов' })
  @Matches(/\S/, { message: 'название предложения не может состоять только из пробелов' })
  title: string;

  /** HTML очищается сервисом непосредственно перед сохранением */
  @IsOptional()
  @IsString()
  @MaxLength(100_000, {
    message: 'описание предложения не может быть длиннее 100000 символов',
  })
  descriptionHtml?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048, { message: 'адрес изображения не может быть длиннее 2048 символов' })
  imageUrl?: string | null;

  @IsIn(Object.values(PRICE_TYPE), { message: 'недопустимый тип цены' })
  priceType: PriceType;

  /**
   * Сумма хранится в копейках без дробной арифметики.
   *
   * Верхняя граница совпадает с диапазоном PostgreSQL INTEGER. Зависимость
   * обязательности amount от priceType проверяется в сервисе.
   */
  @IsOptional()
  @IsInt({ message: 'сумма должна быть целым количеством копеек' })
  @Min(1, { message: 'сумма должна быть больше нуля' })
  @Max(2_147_483_647, { message: 'сумма превышает допустимый диапазон' })
  amount?: number | null;

  /** Например: «за занятие», «за ребёнка» или «до 10 человек» */
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'единица цены не может быть длиннее 100 символов' })
  priceUnit?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'примечание к цене не может быть длиннее 500 символов' })
  priceNote?: string | null;

  @IsOptional()
  @IsInt({ message: 'длительность должна быть целым числом минут' })
  @Min(1, { message: 'длительность должна быть больше нуля' })
  @Max(2_147_483_647, { message: 'длительность превышает допустимый диапазон' })
  durationMinutes?: number | null;

  /**
   * Если поле не передано, Prisma применит INHERIT.
   * Согласованность режима с возрастными границами проверяется в сервисе.
   */
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsIn(Object.values(AGE_MODE), { message: 'недопустимый режим возраста' })
  ageMode?: AgeMode;

  @IsOptional()
  @IsInt({ message: 'минимальный возраст должен быть целым числом месяцев' })
  @Min(0, { message: 'минимальный возраст не может быть отрицательным' })
  @Max(1440, { message: 'минимальный возраст не может превышать 1440 месяцев' })
  ageFromMonths?: number | null;

  @IsOptional()
  @IsInt({ message: 'максимальный возраст должен быть целым числом месяцев' })
  @Min(0, { message: 'максимальный возраст не может быть отрицательным' })
  @Max(1440, { message: 'максимальный возраст не может превышать 1440 месяцев' })
  ageToMonths?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'примечание о возрасте не может быть длиннее 500 символов' })
  ageNote?: string | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean({ message: 'isPublished должен быть логическим значением' })
  isPublished?: boolean;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsInt({ message: 'sortOrder должен быть целым числом' })
  sortOrder?: number;
}
