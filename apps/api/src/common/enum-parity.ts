/**
 * Сверка перечислений Prisma и @minimishki/shared — проверка времени компиляции.
 *
 * Перечисления описаны в проекте дважды намеренно: shared не зависит от Prisma,
 * иначе движок БД уехал бы в клиентский бандл (решение шага 8). Бэкенд —
 * единственное место, где видны оба источника, поэтому сверка живёт здесь.
 *
 * Файл никто не импортирует: он попадает в проверку через include в tsconfig.json
 * и падает на `pnpm typecheck`, если наборы значений разойдутся.
 */
import type { LeadStatus as PrismaLeadStatus, Role as PrismaRole } from '@prisma/client';

import type { LeadStatus as SharedLeadStatus, Role as SharedRole } from '@minimishki/shared';

// Присваивание проходит, только если левый тип вмещает правый. Две строки на пару
// перечислений дают проверку в обе стороны, то есть на равенство наборов значений.
// null as unknown as T — значение нужного типа без его создания: при strict
// напрямую null в строковый союз не приводится.

const _roleParityForward: PrismaRole = null as unknown as SharedRole;
const _roleParityBackward: SharedRole = null as unknown as PrismaRole;

const _leadStatusParityForward: PrismaLeadStatus = null as unknown as SharedLeadStatus;
const _leadStatusParityBackward: SharedLeadStatus = null as unknown as PrismaLeadStatus;
