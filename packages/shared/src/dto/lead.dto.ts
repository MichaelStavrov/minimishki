import type { LeadStatus } from '../enums';
import type { CourseDto } from './course.dto';

/** Заявка на пробное занятие с формы на сайте */
export interface LeadDto {
  id: string;
  /** Имя родителя */
  name: string;
  phone: string;
  childName: string | null;
  childAge: number | null;
  comment: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;

  /** null — заявка без выбора направления либо направление удалили (onDelete: SetNull) */
  courseId: string | null;
  /** Приходит только при запросе с `include`; внутри тоже может быть null */
  course?: CourseDto | null;
}
