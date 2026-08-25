import { Prisma } from '@prisma/client';

/**
 * Публичный контракт GalleryItem.
 *
 * Явный select не позволяет новым полям модели автоматически попасть
 * в HTTP-ответ после будущего изменения Prisma-схемы.
 */
export const GALLERY_ITEM_SELECT = {
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
