import {
  Equals,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/** Тело публичного POST /api/reviews. */
export class CreateReviewDto {
  @IsString()
  @MaxLength(100, { message: 'имя не может быть длиннее 100 символов' })
  @Matches(/\S/, { message: 'имя не может состоять только из пробелов' })
  name: string;

  @IsEmail({}, { message: 'укажите корректный email' })
  @MaxLength(254, { message: 'email не может быть длиннее 254 символов' })
  email: string;

  @IsOptional()
  @IsInt({ message: 'оценка должна быть целым числом' })
  @Min(1, { message: 'оценка должна быть от 1 до 5' })
  @Max(5, { message: 'оценка должна быть от 1 до 5' })
  rating?: number | null;

  @IsString()
  @MaxLength(5000, { message: 'текст отзыва не может быть длиннее 5000 символов' })
  @Matches(/\S/, { message: 'текст отзыва не может состоять только из пробелов' })
  text: string;

  /** Согласие проверяется на сервере, а не только в интерфейсе формы. */
  @IsBoolean({ message: 'consent должен быть логическим значением' })
  @Equals(true, { message: 'нужно согласие на обработку персональных данных' })
  consent: boolean;

  /** Невидимое человеку поле: заполнение обычно означает автоматическую отправку. */
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'недопустимое значение технического поля' })
  website?: string;
}
