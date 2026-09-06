import 'server-only';

import type { Paginated, TeacherDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

const CATALOG_PAGE_SIZE = 12;

export async function getTeachers(page = 1): Promise<Paginated<TeacherDto>> {
  const teachers = await apiRequest<Paginated<TeacherDto>>('/teachers', {
    query: {
      page,
      pageSize: CATALOG_PAGE_SIZE,
    },
    next: {
      revalidate: 60,
    },
  });

  if (teachers === undefined) {
    throw new Error('API вернул пустой ответ вместо каталога педагогов');
  }

  return teachers;
}
