import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * Тело POST /api/services.
 *
 * Содержит только поля самой услуги и идентификаторы связанных педагогов.
 * Группы предложений, тарифы и расписания создаются отдельными запросами:
 * изменение одной вложенной записи не требует отправлять весь граф услуги.
 */
export class CreateServiceDto {
  /**
   * Slug становится частью публичного URL.
   *
   * Разрешены строчные латинские буквы, цифры и одиночные дефисы.
   * Такой формат не требует URL-кодирования и одинаково работает во всех браузерах.
   */
  @IsString()
  @MaxLength(200, { message: 'slug не может быть длиннее 200 символов' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug должен содержать только строчные латинские буквы, цифры и одиночные дефисы',
  })
  slug: string;

  @IsString()
  @MaxLength(200, { message: 'название не может быть длиннее 200 символов' })
  @Matches(/\S/, { message: 'название не может состоять только из пробелов' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'краткое описание не может быть длиннее 1000 символов' })
  summary?: string | null;

  /**
   * Сюда приходит HTML из визуального редактора.
   *
   * DTO проверяет только тип и общий размер. Очистка по allowlist выполняется
   * в сервисе непосредственно перед записью в БД: одной проверки строки
   * недостаточно для защиты от XSS.
   */
  @IsString()
  @MaxLength(100_000, { message: 'содержимое не может быть длиннее 100000 символов' })
  contentHtml: string;

  /** Возраст хранится в полных месяцах: 18 означает 1 год и 6 месяцев */
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

  /**
   * Пока хранилище изображений не выбрано, принимаем строковый адрес:
   * это может быть как абсолютный URL, так и внутренний путь приложения.
   */
  @IsOptional()
  @IsString()
  @MaxLength(2048, { message: 'адрес обложки не может быть длиннее 2048 символов' })
  coverUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'SEO-заголовок не может быть длиннее 200 символов' })
  seoTitle?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'SEO-описание не может быть длиннее 500 символов' })
  seoDescription?: string | null;

  /**
   * Поле необязательно: без него Prisma применит значение false из схемы.
   * Разрешаем передать его явно, чтобы администратор мог сразу опубликовать услугу.
   */
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean({ message: 'isPublished должен быть логическим значением' })
  isPublished?: boolean;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsInt({ message: 'sortOrder должен быть целым числом' })
  sortOrder?: number;

  /**
   * Пустой массив означает «услуга не связана ни с одним педагогом».
   * ArrayUnique не допускает повторного подключения одного педагога.
   */
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray({ message: 'teacherIds должен быть массивом' })
  @ArrayMaxSize(100, { message: 'нельзя связать услугу более чем со 100 педагогами' })
  @ArrayUnique({ message: 'teacherIds не должен содержать повторяющиеся значения' })
  @IsString({ each: true, message: 'каждый teacherId должен быть строкой' })
  teacherIds?: string[];
}
