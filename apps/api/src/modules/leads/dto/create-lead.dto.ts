import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

/** Тело публичного POST /api/leads */
export class CreateLeadDto {
  /** Имя родителя или другого контактного лица */
  @IsString()
  @MaxLength(200, { message: 'имя не может быть длиннее 200 символов' })
  @Matches(/\S/, { message: 'имя не может состоять только из пробелов' })
  name: string;

  /**
   * Номер сохраняется в том виде, в котором его ввёл посетитель.
   *
   * Разрешаем распространённое оформление номера, но ограничиваем количество
   * цифр диапазоном 7–15, чтобы отсечь случайный текст и чрезмерно длинные значения.
   */
  @IsString()
  @MaxLength(50, { message: 'телефон не может быть длиннее 50 символов' })
  @Matches(/^\+?[\d ()-]+$/, {
    message: 'телефон может содержать только цифры, пробелы, скобки, дефисы и плюс в начале',
  })
  @Matches(/^(?=(?:\D*\d){7,15}\D*$).+$/, {
    message: 'телефон должен содержать от 7 до 15 цифр',
  })
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'имя ребёнка не может быть длиннее 200 символов' })
  childName?: string | null;

  /** Возраст ребёнка в полных годах */
  @IsOptional()
  @IsInt({ message: 'возраст ребёнка должен быть целым числом' })
  @Min(0, { message: 'возраст ребёнка не может быть отрицательным' })
  @Max(18, { message: 'возраст ребёнка не может быть больше 18 лет' })
  childAge?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000, { message: 'комментарий не может быть длиннее 5000 символов' })
  comment?: string | null;

  /**
   * null или отсутствие поля означает, что посетитель не выбрал конкретную услугу.
   * Существование, публикацию и отсутствие архива проверит сервис.
   */
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'serviceId не может быть длиннее 100 символов' })
  @Matches(/\S/, { message: 'serviceId не может состоять только из пробелов' })
  serviceId?: string | null;
}
