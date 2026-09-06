import type { Paginated, TeacherDto } from '@minimishki/shared';

import { apiRequest } from '@/shared/api/index.server';

export async function getTeachers(): Promise<Paginated<TeacherDto>> {
  const teachers = await apiRequest<Paginated<TeacherDto>>('/teachers', {
    query: {
      page: 1,
      pageSize: 3,
    },
    next: {
      revalidate: 60,
    },
  });

  if (teachers === undefined) {
    throw new Error('API вернул пустой ответ вместо списка педагогов');
  }

  return teachers;
}
