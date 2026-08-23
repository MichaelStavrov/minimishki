import { PartialType } from '@nestjs/mapped-types';

import { CreateTeacherDto } from './create-teacher.dto';

/** Тело PATCH /api/teachers/:id */
export class UpdateTeacherDto extends PartialType(CreateTeacherDto, {
  skipNullProperties: false,
}) {}
