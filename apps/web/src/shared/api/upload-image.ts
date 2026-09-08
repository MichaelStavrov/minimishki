import type { UploadedImageDto } from '@minimishki/shared';

import { adminApiRequest } from './admin';

/** Загружает изображение через same-origin BFF, не раскрывая JWT браузерному коду. */
export async function uploadImage(file: File): Promise<UploadedImageDto> {
  const formData = new FormData();
  formData.set('file', file);

  const response = await adminApiRequest<UploadedImageDto>('/uploads/images', {
    method: 'POST',
    body: formData,
  });

  if (!response) throw new Error('Сервер не вернул URL загруженного изображения.');

  return response;
}
