import { PartialType } from '@nestjs/mapped-types';
import { CreatePartyItemDto } from './create-party-item.dto';
export class UpdatePartyItemDto extends PartialType(CreatePartyItemDto, {
  skipNullProperties: false,
}) {}
