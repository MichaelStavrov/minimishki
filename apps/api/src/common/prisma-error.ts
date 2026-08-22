import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

type PrismaDomainErrorMessages = {
  /** Сообщение для нарушения уникального индекса — Prisma P2002 */
  unique: string;

  /** Сообщение для отсутствующей записи — Prisma P2025 */
  notFound: string;
};

/**
 * Переводит известные ошибки Prisma в доменные HTTP-исключения Nest.
 *
 * catch получает unknown, потому что JavaScript позволяет бросить любое значение.
 * Функция всегда возвращает Error, поэтому её результат безопасно использовать
 * в конструкции `throw toDomainError(error, messages)`.
 */
export function toDomainError(error: unknown, messages: PrismaDomainErrorMessages): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return new ConflictException(messages.unique);
    }

    if (error.code === 'P2025') {
      return new NotFoundException(messages.notFound);
    }
  }

  return error instanceof Error ? error : new Error(String(error));
}
