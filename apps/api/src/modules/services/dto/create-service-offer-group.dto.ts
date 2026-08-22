import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/**
 * Тело POST /api/services/:serviceId/offer-groups.
 *
 * serviceId берётся из параметра маршрута, поэтому в DTO его нет.
 * Предложения внутри группы создаются отдельными запросами.
 */
export class CreateServiceOfferGroupDto {
  @IsString()
  @MaxLength(200, { message: 'название группы не может быть длиннее 200 символов' })
  @Matches(/\S/, { message: 'название группы не может состоять только из пробелов' })
  title: string;

  /**
   * Необязательный HTML из визуального редактора.
   * Как и содержимое услуги, он будет очищен сервисом перед записью.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100_000, {
    message: 'описание группы не может быть длиннее 100000 символов',
  })
  descriptionHtml?: string | null;

  /**
   * Новая группа по умолчанию остаётся черновиком.
   * Публикация группы не делает видимой неопубликованную услугу.
   */
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean({ message: 'isPublished должен быть логическим значением' })
  isPublished?: boolean;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsInt({ message: 'sortOrder должен быть целым числом' })
  sortOrder?: number;
}
