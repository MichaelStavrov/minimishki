import 'server-only';

import type { PostDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

export async function getPostBySlug(slug: string): Promise<PostDto> {
  const post = await apiRequest<PostDto>(`/posts/${encodeURIComponent(slug)}`, {
    next: { revalidate: 60 },
  });

  if (post === undefined) {
    throw new Error('API вернул пустой ответ вместо публикации');
  }

  return post;
}
