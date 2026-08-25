import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type GalleryItemOwner = {
  postId: string | null;
  serviceId: string | null;
};

/**
 * Проверяет итоговое состояние владельца.
 *
 * DTO ловит два идентификатора в одном запросе, а эта функция также проверяет
 * результат объединения PATCH с текущим состоянием строки из PostgreSQL.
 */
export function validateGalleryItemOwner({ postId, serviceId }: GalleryItemOwner): void {
  if (postId !== null && serviceId !== null) {
    throw new BadRequestException(
      'Фотография не может одновременно принадлежать публикации и услуге',
    );
  }
}

/**
 * Проверяет существование владельца и блокирует его строку до конца транзакции.
 *
 * Без FOR UPDATE публикацию или услугу можно было бы удалить между проверкой
 * существования и созданием связи. Тогда клиент получил бы низкоуровневую ошибку
 * внешнего ключа вместо предсказуемого доменного результата.
 */
export async function lockGalleryItemOwner(
  transaction: Prisma.TransactionClient,
  { postId, serviceId }: GalleryItemOwner,
): Promise<void> {
  validateGalleryItemOwner({ postId, serviceId });

  if (postId !== null) {
    const [post] = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id"
      FROM "Post"
      WHERE "id" = ${postId}
      FOR UPDATE
    `);

    if (!post) {
      throw new NotFoundException('Публикация не найдена');
    }

    return;
  }

  if (serviceId !== null) {
    const [service] = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id"
      FROM "Service"
      WHERE "id" = ${serviceId}
      FOR UPDATE
    `);

    if (!service) {
      throw new NotFoundException('Услуга не найдена');
    }
  }
}
