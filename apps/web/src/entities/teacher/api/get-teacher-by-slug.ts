import 'server-only';

import type { TeacherDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

export async function getTeacherBySlug(slug: string): Promise<TeacherDto> {
  const teacher = await apiRequest<TeacherDto>(`/teachers/${encodeURIComponent(slug)}`, {
    next: {
      revalidate: 60,
    },
  });

  if (teacher === undefined) {
    throw new Error('API вернул пустой ответ вместо педагога');
  }

  return teacher;
}
