import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/** Тело POST /api/teachers */
export class CreateTeacherDto {
  /**
   * Slug становится частью публичного URL /teachers/:slug.
   *
   * Разрешены строчные латинские буквы, цифры и одиночные дефисы.
   */
  @IsString()
  @MaxLength(200, { message: 'slug не может быть длиннее 200 символов' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug должен содержать только строчные латинские буквы, цифры и одиночные дефисы',
  })
  slug: string;

  @IsString()
  @MaxLength(200, { message: 'ФИО не может быть длиннее 200 символов' })
  @Matches(/\S/, { message: 'ФИО не может состоять только из пробелов' })
  fullName: string;

  @IsString()
  @MaxLength(200, { message: 'должность не может быть длиннее 200 символов' })
  @Matches(/\S/, { message: 'должность не может состоять только из пробелов' })
  position: string;

  /**
   * Биография хранится как обычный текст.
   * null явно удаляет ранее сохранённую биографию при обновлении.
   */
  @IsOptional()
  @IsString()
  @MaxLength(20_000, { message: 'биография не может быть длиннее 20000 символов' })
  bio?: string | null;

  /**
   * Пока файловое хранилище не реализовано, принимаем абсолютный URL
   * или внутренний путь приложения.
   */
  @IsOptional()
  @IsString()
  @MaxLength(2048, { message: 'адрес фотографии не может быть длиннее 2048 символов' })
  photoUrl?: string | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean({ message: 'isPublished должен быть логическим значением' })
  isPublished?: boolean;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsInt({ message: 'sortOrder должен быть целым числом' })
  sortOrder?: number;

  /**
   * Пустой массив снимает все связи педагога с услугами.
   * Повторяющиеся идентификаторы запрещены.
   */
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsArray({ message: 'serviceIds должен быть массивом' })
  @ArrayMaxSize(100, { message: 'нельзя связать педагога более чем со 100 услугами' })
  @ArrayUnique({ message: 'serviceIds не должен содержать повторяющиеся значения' })
  @IsString({ each: true, message: 'каждый serviceId должен быть строкой' })
  serviceIds?: string[];
}
