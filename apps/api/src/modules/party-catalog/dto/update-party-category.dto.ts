import { PartialType } from '@nestjs/mapped-types';
import { CreatePartyCategoryDto } from './create-party-category.dto';
export class UpdatePartyCategoryDto extends PartialType(CreatePartyCategoryDto, {
  skipNullProperties: false,
}) {}
