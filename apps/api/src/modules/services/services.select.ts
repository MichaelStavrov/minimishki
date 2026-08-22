import { Prisma } from '@prisma/client';

export const SERVICE_OFFER_SELECT = {
  id: true,
  groupId: true,
  title: true,
  descriptionHtml: true,
  imageUrl: true,
  priceType: true,
  amount: true,
  priceUnit: true,
  priceNote: true,
  durationMinutes: true,
  ageMode: true,
  ageFromMonths: true,
  ageToMonths: true,
  ageNote: true,
  isPublished: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ServiceOfferSelect;

export const SERVICE_OFFER_GROUP_SELECT = {
  id: true,
  serviceId: true,
  title: true,
  descriptionHtml: true,
  isPublished: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ServiceOfferGroupSelect;

export const SERVICE_SCHEDULE_SELECT = {
  id: true,
  serviceId: true,
  scheduleType: true,
  daysOfWeek: true,
  startTime: true,
  endTime: true,
  validFrom: true,
  validUntil: true,
  label: true,
  isPublished: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ServiceScheduleSelect;

const TEACHER_SELECT = {
  id: true,
  slug: true,
  fullName: true,
  position: true,
  bio: true,
  photoUrl: true,
  isPublished: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TeacherSelect;

const GALLERY_ITEM_SELECT = {
  id: true,
  url: true,
  alt: true,
  caption: true,
  isPublished: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  postId: true,
  serviceId: true,
} satisfies Prisma.GalleryItemSelect;

export const SERVICE_SELECT = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  contentHtml: true,
  ageFromMonths: true,
  ageToMonths: true,
  ageNote: true,
  coverUrl: true,
  seoTitle: true,
  seoDescription: true,
  isPublished: true,
  archivedAt: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ServiceSelect;

const ADMIN_OFFER_GROUP_SELECT = {
  ...SERVICE_OFFER_GROUP_SELECT,
  offers: {
    select: SERVICE_OFFER_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.ServiceOfferGroupSelect;

const PUBLIC_OFFER_GROUP_SELECT = {
  ...SERVICE_OFFER_GROUP_SELECT,
  offers: {
    where: { isPublished: true },
    select: SERVICE_OFFER_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.ServiceOfferGroupSelect;

/** Полная карточка для административного редактирования */
export const SERVICE_ADMIN_DETAIL_SELECT = {
  ...SERVICE_SELECT,
  offerGroups: {
    select: ADMIN_OFFER_GROUP_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
  schedules: {
    select: SERVICE_SCHEDULE_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
  teachers: {
    select: TEACHER_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { fullName: 'asc' }],
  },
  gallery: {
    select: GALLERY_ITEM_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.ServiceSelect;

/** Публичная карточка: только опубликованные дочерние записи */
export const SERVICE_PUBLIC_DETAIL_SELECT = {
  ...SERVICE_SELECT,
  offerGroups: {
    where: { isPublished: true },
    select: PUBLIC_OFFER_GROUP_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
  schedules: {
    where: { isPublished: true },
    select: SERVICE_SCHEDULE_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
  teachers: {
    where: { isPublished: true },
    select: TEACHER_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { fullName: 'asc' }],
  },
  gallery: {
    where: { isPublished: true },
    select: GALLERY_ITEM_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.ServiceSelect;
