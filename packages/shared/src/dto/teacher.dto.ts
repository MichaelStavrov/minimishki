import type { CourseDto } from './course.dto';

/** Педагог центра */
export interface TeacherDto {
  id: string;
  slug: string;
  fullName: string;
  position: string;
  bio: string | null;
  photoUrl: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;

  /** Приходит только при запросе с `include` */
  courses?: CourseDto[];
}
