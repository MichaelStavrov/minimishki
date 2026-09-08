import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';

import { ROLE, type UploadedImageDto } from '@minimishki/shared';

import { Roles } from '../../auth/decorators/roles.decorator';
import {
  IMAGE_MIME_TYPES,
  isImageMimeType,
  MAX_IMAGE_SIZE_BYTES,
  UPLOADS_DIRECTORY,
} from './uploads.constants';

/** Принимает изображения сотрудников и возвращает URL, который сохраняет редактор. */
@Controller('uploads')
export class UploadsController {
  @Roles(ROLE.ADMIN, ROLE.MANAGER)
  @Post('images')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOADS_DIRECTORY,
        filename: (_request, file, callback) => {
          if (!isImageMimeType(file.mimetype)) {
            callback(new BadRequestException('Разрешены только изображения JPEG, PNG и WebP.'), '');
            return;
          }

          callback(null, `${randomUUID()}.${IMAGE_MIME_TYPES[file.mimetype]}`);
        },
      }),
      limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
      fileFilter: (_request, file, callback) => {
        callback(null, isImageMimeType(file.mimetype));
      },
    }),
  )
  uploadImage(@UploadedFile() file?: Express.Multer.File): UploadedImageDto {
    if (!file) {
      throw new BadRequestException('Выберите изображение JPEG, PNG или WebP размером до 10 МБ.');
    }

    return { url: `/uploads/${file.filename}` };
  }
}
