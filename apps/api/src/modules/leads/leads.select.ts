import { Prisma } from '@prisma/client';

import { SERVICE_SELECT } from '../services/services.select';

/** Поля заявки без загрузки связанной услуги — используются в списке */
export const LEAD_SELECT = {
  id: true,
  name: true,
  phone: true,
  childName: true,
  childAge: true,
  comment: true,
  consentedAt: true,
  consentVersion: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  serviceId: true,
} satisfies Prisma.LeadSelect;

/** Внутренний комментарий добавляется только в защищённые административные ответы. */
export const LEAD_ADMIN_SELECT = {
  ...LEAD_SELECT,
  managerComment: true,
} satisfies Prisma.LeadSelect;

/** История не включает email сотрудника: он не нужен для отображения действия. */
export const LEAD_STATUS_CHANGE_SELECT = {
  id: true,
  fromStatus: true,
  toStatus: true,
  createdAt: true,
  manager: {
    select: {
      id: true,
      name: true,
      role: true,
    },
  },
} satisfies Prisma.LeadStatusChangeSelect;

/** Карточка заявки вместе с актуальными данными выбранной услуги */
export const LEAD_DETAIL_SELECT = {
  ...LEAD_ADMIN_SELECT,
  service: {
    select: SERVICE_SELECT,
  },
} satisfies Prisma.LeadSelect;
