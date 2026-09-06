/**
 * Публичный API пакета `@minimishki/shared`.
 *
 * Наружу видно только то, что перечислено здесь: `exports` в package.json
 * закрывает прямые импорты вида `@minimishki/shared/dist/enums`.
 */

// Перечисления: значения и одноимённые типы
export {
  ROLE,
  LEAD_STATUS,
  REVIEW_STATUS,
  PRICE_TYPE,
  SCHEDULE_TYPE,
  DAY_OF_WEEK,
  AGE_MODE,
} from './enums';

export type {
  Role,
  LeadStatus,
  ReviewStatus,
  PriceType,
  ScheduleType,
  DayOfWeek,
  AgeMode,
} from './enums';

// Служебные обёртки и ответы API
export type { Paginated, ApiErrorDto } from './dto/common.dto';
export type { HealthDto } from './dto/health.dto';

// Аутентификация
export type { LoginResponseDto } from './dto/auth.dto';

// Сущности домена
export type { UserDto } from './dto/user.dto';
export type {
  ServiceDto,
  ServiceOfferGroupDto,
  ServiceOfferDto,
  ServiceScheduleDto,
} from './dto/service.dto';
export type { TeacherDto } from './dto/teacher.dto';
export type { PostDto } from './dto/post.dto';
export type { GalleryItemDto } from './dto/gallery.dto';
export type { PartyCategoryDto, PartyItemDto } from './dto/party.dto';
export type { LeadDto } from './dto/lead.dto';
export type { ReviewDto, ReviewAdminDto } from './dto/review.dto';
export type { SearchResultDto, SearchResponseDto, SearchResultType } from './dto/search.dto';
