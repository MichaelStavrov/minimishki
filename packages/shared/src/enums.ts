/**
 * Перечисления домена.
 *
 * Дублируют `enum Role` и `enum LeadStatus` из `schema.prisma` намеренно:
 * зависимость от `@prisma/client` утянула бы движок БД в клиентский бандл.
 * Рассинхрон ловится проверкой типов на бэкенде — см. `apps/api/src/common/enum-parity.ts`.
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
  /** Записан на занятие */
  CONFIRMED: 'CONFIRMED',
  /** Отказ */
  REJECTED: 'REJECTED',
} as const;

export type LeadStatus = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];
