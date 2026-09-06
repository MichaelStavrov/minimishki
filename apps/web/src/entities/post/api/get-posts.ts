import 'server-only';

import type { Paginated, PostDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

const POSTS_PAGE_SIZE = 9;

export async function getPosts(page: number): Promise<Paginated<PostDto>> {
  const posts = await apiRequest<Paginated<PostDto>>('/posts', {
    query: { page, pageSize: POSTS_PAGE_SIZE },
    next: { revalidate: 60 },
  });

  if (posts === undefined) {
    throw new Error('API вернул пустой ответ вместо списка публикаций');
  }

  return posts;
}
