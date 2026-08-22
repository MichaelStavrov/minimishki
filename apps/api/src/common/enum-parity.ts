/**
 * Сверка перечислений Prisma и @minimishki/shared — проверка времени компиляции.
 *
 * Перечисления описаны в проекте дважды намеренно: shared не зависит от Prisma,
 * иначе серверный пакет Prisma попал бы в клиентский бандл.
 *
 * Бэкенд — единственное место, где видны оба источника, поэтому сверка живёт здесь.
 * Файл никто не импортирует: он попадает в проверку через include в tsconfig.json
 * и ломает `pnpm typecheck`, если наборы значений разойдутся.
 */

import type {
  AgeMode as PrismaAgeMode,
  DayOfWeek as PrismaDayOfWeek,
  LeadStatus as PrismaLeadStatus,
  PriceType as PrismaPriceType,
  Role as PrismaRole,
  ScheduleType as PrismaScheduleType,
} from '@prisma/client';

import type {
  AgeMode as SharedAgeMode,
  DayOfWeek as SharedDayOfWeek,
  LeadStatus as SharedLeadStatus,
  PriceType as SharedPriceType,
  Role as SharedRole,
  ScheduleType as SharedScheduleType,
} from '@minimishki/shared';

/**
 * Возвращает true, только если два типа совместимы в обе стороны.
 *
 * Кортежи вокруг типов запрещают условному типу распределяться по отдельным
 * элементам union-типа.
 */
type IsExact<TLeft, TRight> = [TLeft] extends [TRight]
  ? [TRight] extends [TLeft]
    ? true
    : false
  : false;

/** Компиляция падает, если переданное условие не равно true. */
type Assert<TCondition extends true> = TCondition;

/**
 * Каждая строка проверяет одну пару перечислений.
 *
 * Тип экспортируется только для того, чтобы TypeScript не считал его неиспользуемым.
 * В скомпилированный JavaScript он не попадает.
 */
export type EnumParityCheck = [
  Assert<IsExact<PrismaRole, SharedRole>>,
  Assert<IsExact<PrismaLeadStatus, SharedLeadStatus>>,
  Assert<IsExact<PrismaPriceType, SharedPriceType>>,
  Assert<IsExact<PrismaScheduleType, SharedScheduleType>>,
  Assert<IsExact<PrismaDayOfWeek, SharedDayOfWeek>>,
  Assert<IsExact<PrismaAgeMode, SharedAgeMode>>,
];
