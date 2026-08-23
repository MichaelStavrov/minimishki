import { Prisma } from '@prisma/client';

import { SERVICE_SELECT } from '../services/services.select';

export const TEACHER_SELECT = {
  id: true,
  slug: true,
  fullName: true,
  position: true,
  bio: true,
  photoUrl: true,
  isPublished: true,
  archivedAt: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TeacherSelect;

/** Полная карточка для административного редактирования */
export const TEACHER_ADMIN_DETAIL_SELECT = {
  ...TEACHER_SELECT,
  services: {
    select: SERVICE_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
  },
} satisfies Prisma.TeacherSelect;

/** Публичная карточка: только опубликованные неархивные услуги */
export const TEACHER_PUBLIC_DETAIL_SELECT = {
  ...TEACHER_SELECT,
  services: {
    where: {
      isPublished: true,
      archivedAt: null,
    },
    select: SERVICE_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
  },
} satisfies Prisma.TeacherSelect;
