import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

const ISO_DATE_TIME_WITH_TIME_ZONE = /T.+(?:Z|[+-]\d{2}:\d{2})$/i;
const REGISTRATION_URL = /^(?:\/(?!\/)[^\s]*|https?:\/\/[^/\s?#]+(?:[/?#][^\s]*)?)$/i;

/** Тело POST /api/posts */
export class CreatePostDto {
  /**
   * Slug становится частью публичного URL /posts/:slug.
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
  @MaxLength(200, { message: 'заголовок не может быть длиннее 200 символов' })
  @Matches(/\S/, { message: 'заголовок не может состоять только из пробелов' })
  title: string;

  /** Краткий текст для карточки в ленте */
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'анонс не может быть длиннее 1000 символов' })
  excerpt?: string | null;

  /**
   * HTML из визуального редактора.
   *
   * DTO ограничивает тип и размер. Очистка от опасных тегов, атрибутов и URL
   * выполняется в сервисе непосредственно перед записью в PostgreSQL.
   */
  @IsString()
  @MaxLength(100_000, { message: 'содержимое не может быть длиннее 100000 символов' })
  contentHtml: string;

  /**
   * Пока файловое хранилище не реализовано, обложка задаётся абсолютным URL
   * или внутренним путём приложения.
   */
  @IsOptional()
  @IsString()
  @MaxLength(2048, { message: 'адрес обложки не может быть длиннее 2048 символов' })
  coverUrl?: string | null;

  /** Дата и время начала события в формате ISO 8601 */
  @IsOptional()
  @IsDateString({}, { message: 'eventStartsAt должен быть датой в формате ISO 8601' })
  @Matches(ISO_DATE_TIME_WITH_TIME_ZONE, {
    message: 'eventStartsAt должен содержать время и часовой пояс',
  })
  eventStartsAt?: string | null;

  /**
   * Дата и время окончания события.
   * Правило eventEndsAt > eventStartsAt проверяется в сервисе и PostgreSQL.
   */
  @IsOptional()
  @IsDateString({}, { message: 'eventEndsAt должен быть датой в формате ISO 8601' })
  @Matches(ISO_DATE_TIME_WITH_TIME_ZONE, {
    message: 'eventEndsAt должен содержать время и часовой пояс',
  })
  eventEndsAt?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'подпись возраста не может быть длиннее 200 символов' })
  ageLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'подпись цены не может быть длиннее 200 символов' })
  priceLabel?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'описание записи не может быть длиннее 500 символов' })
  registrationLabel?: string | null;

  /**
   * Разрешён абсолютный HTTP(S)-адрес или внутренний путь приложения.
   * Протоколы вроде javascript: и protocol-relative URL //example.com запрещены.
   */
  @IsOptional()
  @IsString()
  @MaxLength(2048, { message: 'ссылка для записи не может быть длиннее 2048 символов' })
  @Matches(REGISTRATION_URL, {
    message: 'registrationUrl должен быть внутренним путём или HTTP(S)-адресом',
  })
  registrationUrl?: string | null;

  /**
   * Если true передан без publishedAt, сервис установит текущее время.
   * false создаёт или сохраняет черновик.
   */
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean({ message: 'isPublished должен быть логическим значением' })
  isPublished?: boolean;

  /**
   * Администратор может задать историческую или будущую дату.
   * Будущая дата создаёт отложенную публикацию.
   */
  @IsOptional()
  @IsDateString({}, { message: 'publishedAt должен быть датой в формате ISO 8601' })
  @Matches(ISO_DATE_TIME_WITH_TIME_ZONE, {
    message: 'publishedAt должен содержать время и часовой пояс',
  })
  publishedAt?: string | null;
}
