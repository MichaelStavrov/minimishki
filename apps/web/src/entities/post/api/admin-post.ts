import type { GalleryItemDto, Paginated, PostDto } from '@minimishki/shared';

import { adminApiRequest } from '@/shared/api/admin';

export type AdminPostsQuery = {
  page: number;
  pageSize: number;
  search?: string;
  isPublished?: boolean;
};

export type PostValues = {
  slug: string;
  title: string;
  excerpt: string | null;
  contentHtml: string;
  coverUrl: string | null;
  eventStartsAt: string | null;
  eventEndsAt: string | null;
  ageLabel: string | null;
  priceLabel: string | null;
  registrationLabel: string | null;
  registrationUrl: string | null;
  isPublished: boolean;
  publishedAt?: string | null;
};

export type GalleryItemValues = {
  url: string;
  alt: string | null;
  caption: string | null;
  isPublished: boolean;
  sortOrder: number;
  postId: string;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

export function getAdminPosts(query: AdminPostsQuery): Promise<Paginated<PostDto>> {
  return required(
    adminApiRequest<Paginated<PostDto>>('/posts/admin', { query }),
    'Сервер вернул пустой ответ вместо списка новостей.',
  );
}

export function getAdminPost(id: string): Promise<PostDto> {
  return required(
    adminApiRequest<PostDto>(`/posts/admin/${id}`),
    'Сервер вернул пустой ответ вместо новости.',
  );
}

export function createPost(values: PostValues): Promise<PostDto> {
  return required(
    adminApiRequest<PostDto>('/posts', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул созданную новость.',
  );
}

export function updatePost(id: string, values: Partial<PostValues>): Promise<PostDto> {
  return required(
    adminApiRequest<PostDto>(`/posts/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул сохранённую новость.',
  );
}

export async function removePost(id: string): Promise<void> {
  await adminApiRequest<void>(`/posts/${id}`, { method: 'DELETE' });
}

export function createPostGalleryItem(values: GalleryItemValues): Promise<GalleryItemDto> {
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

  if (response === undefined) {
    throw new Error(errorMessage);
  }

  return response;
}
