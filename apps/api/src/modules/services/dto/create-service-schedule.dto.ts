import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';

import { DAY_OF_WEEK, SCHEDULE_TYPE, type DayOfWeek, type ScheduleType } from '@minimishki/shared';

const DAY_OF_WEEK_ORDER = new Map<string, number>(
  Object.values(DAY_OF_WEEK).map((day, index) => [day, index]),
);

/**
 * Встроенный Array.isArray сужает unknown до any[].
 * Отдельный type guard сохраняет безопасный тип элементов unknown.
 */
function isUnknownArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Сортирует только массив. Остальные значения возвращает как есть, чтобы
 * @IsArray сформировал корректную ошибку валидации вместо ошибки преобразования.
 *
 * Неизвестные элементы не удаляются: @IsIn должен отклонить их, а не позволить
 * запросу незаметно изменить пользовательские данные.
 */
function sortDaysOfWeek(value: unknown): unknown {
  if (!isUnknownArray(value)) {
    return value;
  }

  return [...value].sort((left, right) => {
    const leftIndex =
      typeof left === 'string' ? (DAY_OF_WEEK_ORDER.get(left) ?? Number.MAX_SAFE_INTEGER) : -1;
    const rightIndex =
      typeof right === 'string' ? (DAY_OF_WEEK_ORDER.get(right) ?? Number.MAX_SAFE_INTEGER) : -1;

    return leftIndex - rightIndex;
  });
}

/**
 * Тело POST /api/services/:serviceId/schedules.
 *
 * serviceId определяется параметром маршрута. Расписание нельзя переносить
 * между услугами обычным PATCH-запросом.
 */
export class CreateServiceScheduleDto {
  @IsIn(Object.values(SCHEDULE_TYPE), { message: 'недопустимый тип расписания' })
  scheduleType: ScheduleType;

  /**
   * Поле необязательно, потому что для ON_REQUEST Prisma использует пустой массив.
   * Для RECURRING обязательность хотя бы одного дня проверяется в сервисе.
   */
  @ValidateIf((_object, value: unknown) => value !== undefined)
  @Transform(({ value }) => sortDaysOfWeek(value))
  @IsArray({ message: 'daysOfWeek должен быть массивом' })
  @ArrayUnique({ message: 'daysOfWeek не должен содержать повторяющиеся дни' })
  @IsIn(Object.values(DAY_OF_WEEK), {
    each: true,
    message: 'daysOfWeek содержит недопустимый день недели',
  })
  daysOfWeek?: DayOfWeek[];

  /** Локальное время центра без часового пояса, строго в формате HH:mm */
  @IsOptional()
  @IsString()
  @Matches(/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime должен иметь формат HH:mm',
  })
  startTime?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime должен иметь формат HH:mm',
  })
  endTime?: string | null;

  /**
   * Дата без времени и часового пояса.
   * Matches фиксирует формат, а IsDateString дополнительно отсекает невозможные даты.
   */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'validFrom должен иметь формат YYYY-MM-DD',
  })
  @IsDateString(
    { strict: true, strictSeparator: true },
    { message: 'validFrom должен быть корректной календарной датой' },
  )
  validFrom?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'validUntil должен иметь формат YYYY-MM-DD',
  })
  @IsDateString(
    { strict: true, strictSeparator: true },
    { message: 'validUntil должен быть корректной календарной датой' },
  )
  validUntil?: string | null;

  /** Например: «Время согласовывается с администратором» */
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'подпись расписания не может быть длиннее 500 символов' })
  @Matches(/\S/, { message: 'подпись расписания не может состоять только из пробелов' })
  label?: string | null;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsBoolean({ message: 'isPublished должен быть логическим значением' })
  isPublished?: boolean;

  @ValidateIf((_object, value: unknown) => value !== undefined)
  @IsInt({ message: 'sortOrder должен быть целым числом' })
  sortOrder?: number;
}
