import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreatePartyCategoryDto {
  @IsString() @MaxLength(120) @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug: string;
  @IsString() @MaxLength(200) @Matches(/\S/) title: string;
  @IsOptional() @IsString() @MaxLength(1000) description?: string | null;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsInt() sortOrder?: number;
}
