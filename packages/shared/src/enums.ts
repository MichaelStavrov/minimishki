/**
 * Перечисления домена.
 *
 * Дублируют enum из `schema.prisma` намеренно: зависимость от
 * `@prisma/client` утянула бы серверный пакет Prisma в клиентский бандл.
 *
 * Рассинхрон ловится проверкой типов на бэкенде —
 * см. `apps/api/src/common/enum-parity.ts`.
 */

/** Роль пользователя: определяет доступ к разделам админки */
export const ROLE = {
  /** Полный доступ */
  ADMIN: 'ADMIN',
  /** Работа с заявками и контентом */
  MANAGER: 'MANAGER',
  /** Обычный пользователь */
  USER: 'USER',
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];

/** Стадия обработки заявки с формы на сайте */
export const LEAD_STATUS = {
  /** Новая заявка, никто ещё не смотрел */
  NEW: 'NEW',
  /** Менеджер связался с родителем */
  IN_PROGRESS: 'IN_PROGRESS',
  /** Запись подтверждена */
  CONFIRMED: 'CONFIRMED',
  /** Отказ */
  REJECTED: 'REJECTED',
} as const;

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

/** Способ представления цены предложения */
export const PRICE_TYPE = {
  /** Фиксированная цена */
  FIXED: 'FIXED',
  /** Цена начинается с указанной суммы */
  FROM: 'FROM',
  /** Услуга предоставляется бесплатно */
  FREE: 'FREE',
  /** Предложение входит в стоимость другой услуги */
  INCLUDED: 'INCLUDED',
  /** Цена рассчитывается индивидуально */
  ON_REQUEST: 'ON_REQUEST',
} as const;

export type PriceType = (typeof PRICE_TYPE)[keyof typeof PRICE_TYPE];

/** Способ задания расписания услуги */
export const SCHEDULE_TYPE = {
  /** Регулярное расписание по дням недели */
  RECURRING: 'RECURRING',
  /** Время определяется по согласованию */
  ON_REQUEST: 'ON_REQUEST',
} as const;

export type ScheduleType = (typeof SCHEDULE_TYPE)[keyof typeof SCHEDULE_TYPE];

/** День недели в ISO-порядке, начиная с понедельника */
export const DAY_OF_WEEK = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY',
} as const;

export type DayOfWeek = (typeof DAY_OF_WEEK)[keyof typeof DAY_OF_WEEK];

/** Правило определения возрастных ограничений предложения */
export const AGE_MODE = {
  /** Использовать возрастной диапазон основной услуги */
  INHERIT: 'INHERIT',
  /** Использовать собственный возрастной диапазон */
  CUSTOM: 'CUSTOM',
  /** Явно снять возрастные ограничения */
  NONE: 'NONE',
} as const;

export type AgeMode = (typeof AGE_MODE)[keyof typeof AGE_MODE];
