import { Prisma } from '@prisma/client';

/** Поля, которые безопасно показывать любому посетителю сайта. */
export const REVIEW_PUBLIC_SELECT = {
  id: true,
  name: true,
  rating: true,
  text: true,
  createdAt: true,
} satisfies Prisma.ReviewSelect;

/** Email нужен для связи с автором и сознательно доступен лишь очереди модерации. */
export const REVIEW_ADMIN_SELECT = {
  ...REVIEW_PUBLIC_SELECT,
  email: true,
  status: true,
  consentedAt: true,
  updatedAt: true,
} satisfies Prisma.ReviewSelect;
