import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateIf,
  type ValidationArguments,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

const IMAGE_URL = /^(?:\/(?!\/)[^\s]*|https?:\/\/[^/\s?#]+(?:[/?#][^\s]*)?)$/i;

@ValidatorConstraint({ name: 'hasSingleGalleryItemOwner', async: false })
class HasSingleGalleryItemOwnerConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, arguments_: ValidationArguments): boolean {
    const object = arguments_.object as CreateGalleryItemDto;

    return object.postId == null || object.serviceId == null;
  }

  defaultMessage(): string {
    return 'фотография не может одновременно принадлежать публикации и услуге';
  }
}

/** Тело POST /api/gallery-items */
export class CreateGalleryItemDto {
  /**
   * Пока файловое хранилище не реализовано, API принимает готовый адрес изображения.
   *
   * Разрешены:
   * - внутренний путь приложения: /images/gallery/photo.jpg;
   * - абсолютный HTTP(S)-адрес.
   *
   * Protocol-relative адреса //example.com и остальные протоколы запрещены.
   */
  @IsString()
  @MaxLength(2048, { message: 'адрес изображения не может быть длиннее 2048 символов' })
  @Matches(IMAGE_URL, {
    message: 'url должен быть внутренним путём или HTTP(S)-адресом',
  })
  url: string;

  /** Alt-текст для доступности и поисковых систем */
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'alt-текст не может быть длиннее 500 символов' })
  alt?: string | null;

  /** Видимая подпись под фотографией */
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'подпись не может быть длиннее 1000 символов' })
  caption?: string | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean({ message: 'isPublished должен быть логическим значением' })
  isPublished?: boolean;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsInt({ message: 'sortOrder должен быть целым числом' })
  @Min(-2_147_483_648, { message: 'sortOrder не может быть меньше -2147483648' })
  @Max(2_147_483_647, { message: 'sortOrder не может быть больше 2147483647' })
  sortOrder?: number;

  /**
   * Идентификатор публикации-владельца.
   *
   * null или отсутствие поля означает, что фотография не относится к публикации.
   * Дополнительный валидатор запрещает одновременно задавать postId и serviceId.
   */
  @IsOptional()
  @IsString({ message: 'postId должен быть строкой' })
  @MaxLength(100, { message: 'postId не может быть длиннее 100 символов' })
  @Matches(/\S/, { message: 'postId не может быть пустой строкой' })
  @Validate(HasSingleGalleryItemOwnerConstraint)
  postId?: string | null;

  /**
   * Идентификатор услуги-владельца.
   *
   * Существование публикации или услуги DTO проверить не может: для этого нужен
   * запрос в PostgreSQL, который позже выполнит GalleryItemsService.
   */
  @IsOptional()
  @IsString({ message: 'serviceId должен быть строкой' })
  @MaxLength(100, { message: 'serviceId не может быть длиннее 100 символов' })
  @Matches(/\S/, { message: 'serviceId не может быть пустой строкой' })
  serviceId?: string | null;
}
