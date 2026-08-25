import { PartialType } from '@nestjs/mapped-types';

import { CreatePostDto } from './create-post.dto';

/** Тело PATCH /api/posts/:id */
export class UpdatePostDto extends PartialType(CreatePostDto) {}
