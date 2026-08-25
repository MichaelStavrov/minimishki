import { PartialType } from '@nestjs/mapped-types';

import { CreateGalleryItemDto } from './create-gallery-item.dto';

/**
 * Тело PATCH /api/gallery-items/:id.
 *
 * PartialType создаёт новый runtime-класс, копирует правила class-validator
 * из CreateGalleryItemDto и делает каждое поле необязательным.
 */
export class UpdateGalleryItemDto extends PartialType(CreateGalleryItemDto) {}
