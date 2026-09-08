import { join } from 'node:path';

/** Локальная директория первого этапа хранения медиафайлов. */
export const UPLOADS_DIRECTORY = join(__dirname, '..', '..', '..', 'uploads');

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const IMAGE_MIME_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

export type ImageMimeType = keyof typeof IMAGE_MIME_TYPES;

export function isImageMimeType(value: string): value is ImageMimeType {
  return value in IMAGE_MIME_TYPES;
}
