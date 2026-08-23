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
  status: true,
  createdAt: true,
  updatedAt: true,
  serviceId: true,
} satisfies Prisma.LeadSelect;

/** Карточка заявки вместе с актуальными данными выбранной услуги */
export const LEAD_DETAIL_SELECT = {
  ...LEAD_SELECT,
  service: {
    select: SERVICE_SELECT,
  },
} satisfies Prisma.LeadSelect;
