import { Prisma } from '@prisma/client';

/** Поля новости, доступные в списках и подробных ответах */
export const POST_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  contentHtml: true,
  coverUrl: true,
  eventStartsAt: true,
  eventEndsAt: true,
  ageLabel: true,
  priceLabel: true,
  registrationLabel: true,
  registrationUrl: true,
  isPublished: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PostSelect;

/** Поля изображения, входящего в галерею новости */
const POST_GALLERY_ITEM_SELECT = {
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

/** Административная карточка содержит все связанные изображения */
export const POST_ADMIN_DETAIL_SELECT = {
  ...POST_SELECT,
  gallery: {
    select: POST_GALLERY_ITEM_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.PostSelect;

/** Публичная карточка содержит только опубликованные изображения */
export const POST_PUBLIC_DETAIL_SELECT = {
  ...POST_SELECT,
  gallery: {
    where: {
      isPublished: true,
    },
    select: POST_GALLERY_ITEM_SELECT,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  },
} satisfies Prisma.PostSelect;
