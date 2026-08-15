/**
 * Публичный API пакета `@minimishki/shared`.
 *
 * Наружу видно только то, что перечислено здесь: `exports` в package.json
 * закрывает прямые импорты вида `@minimishki/shared/dist/enums`.
 */

// Перечисления: значения и одноимённые типы
export { ROLE, LEAD_STATUS } from './enums';
export type { Role, LeadStatus } from './enums';

// Служебные обёртки ответов API
export type { Paginated, ApiErrorDto } from './dto/common.dto';

// Сущности домена
export type { UserDto } from './dto/user.dto';
export type { CourseDto } from './dto/course.dto';
export type { TeacherDto } from './dto/teacher.dto';
export type { PostDto } from './dto/post.dto';
export type { GalleryItemDto } from './dto/gallery.dto';
export type { LeadDto } from './dto/lead.dto';
