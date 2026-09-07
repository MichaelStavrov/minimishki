import { IsString, MaxLength, ValidateIf } from 'class-validator';

/** Тело PATCH /api/leads/:id/manager-comment. null очищает внутреннюю заметку. */
export class UpdateLeadManagerCommentDto {
  @ValidateIf((_object, value) => value !== null)
  @IsString({ message: 'managerComment должен быть строкой или null' })
  @MaxLength(5000, { message: 'внутренний комментарий не может быть длиннее 5000 символов' })
  managerComment: string | null;
}
