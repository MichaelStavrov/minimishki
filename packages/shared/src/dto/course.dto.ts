import type { TeacherDto } from './teacher.dto';

/** Направление / программа центра */
export interface CourseDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  /** Возраст от, полных лет */
  ageFrom: number;
  /** Возраст до, полных лет */
  ageTo: number;
  /** Рубли, целое число */
  price: number;
  imageUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;

  /** Приходит только при запросе с `include` */
  teachers?: TeacherDto[];
}
