import 'server-only';

import type { GalleryItemDto, Paginated } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

const GALLERY_PAGE_SIZE = 18;

export async function getGalleryItems(page: number): Promise<Paginated<GalleryItemDto>> {
  const gallery = await apiRequest<Paginated<GalleryItemDto>>('/gallery-items', {
    query: { page, pageSize: GALLERY_PAGE_SIZE },
    next: { revalidate: 60 },
  });

  if (gallery === undefined) {
    throw new Error('API вернул пустой ответ вместо списка фотографий');
  }

  return gallery;
}
