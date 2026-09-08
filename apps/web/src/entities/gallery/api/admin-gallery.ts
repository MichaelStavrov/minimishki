import type { GalleryItemDto, Paginated } from '@minimishki/shared';

import { adminApiRequest } from '@/shared/api/admin';

export type AdminGalleryQuery = {
  page: number;
  pageSize: number;
  search?: string;
  isPublished?: boolean;
};

export type GalleryItemValues = {
  url: string;
  alt: string | null;
  caption: string | null;
  isPublished: boolean;
  sortOrder: number;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

/** Возвращает только фотографии общей галереи, без материалов услуг и новостей. */
export function getAdminGalleryItems(query: AdminGalleryQuery): Promise<Paginated<GalleryItemDto>> {
  return required(
    adminApiRequest<Paginated<GalleryItemDto>>('/gallery-items/admin', {
      query: { ...query, ownerType: 'GENERAL' },
    }),
    'Сервер вернул пустой ответ вместо списка фотографий.',
  );
}

export function getAdminGalleryItem(id: string): Promise<GalleryItemDto> {
  return required(
    adminApiRequest<GalleryItemDto>(`/gallery-items/admin/${id}`),
    'Сервер вернул пустой ответ вместо фотографии.',
  );
}

export function createGalleryItem(values: GalleryItemValues): Promise<GalleryItemDto> {
  return required(
    adminApiRequest<GalleryItemDto>('/gallery-items', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул добавленную фотографию.',
  );
}

export function updateGalleryItem(
  id: string,
  values: Partial<GalleryItemValues>,
): Promise<GalleryItemDto> {
  return required(
    adminApiRequest<GalleryItemDto>(`/gallery-items/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул сохранённую фотографию.',
  );
}

export async function removeGalleryItem(id: string): Promise<void> {
  await adminApiRequest<void>(`/gallery-items/${id}`, { method: 'DELETE' });
}

async function required<T>(promise: Promise<T | undefined>, errorMessage: string): Promise<T> {
  const response = await promise;

  if (response === undefined) throw new Error(errorMessage);

  return response;
}
