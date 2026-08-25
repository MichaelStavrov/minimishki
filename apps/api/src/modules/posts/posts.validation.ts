import { BadRequestException } from '@nestjs/common';

import { hasEditorHtmlText, sanitizeEditorHtml } from '../../common/editor-html.sanitizer';

type PostState = {
  isPublished: boolean;
  publishedAt: Date | null;
  eventStartsAt: Date | null;
  eventEndsAt: Date | null;
};

/**
 * Очищает обязательное содержимое публикации.
 *
 * Если allowlist удалил всё содержимое, сохранять пустую публикацию нельзя.
 */
export function sanitizeRequiredPostHtml(html: string): string {
  const sanitized = sanitizeEditorHtml(html);

  if (!hasEditorHtmlText(sanitized)) {
    throw new BadRequestException('Содержимое публикации не может быть пустым после очистки HTML');
  }

  return sanitized;
}

/**
 * Проверяет зависимые правила после объединения текущей записи с данными PATCH.
 *
 * DTO не может выполнить эту проверку самостоятельно: в частичном обновлении
 * eventStartsAt или publishedAt могут отсутствовать в теле, но уже существовать в БД.
 */
export function validatePostState({
  isPublished,
  publishedAt,
  eventStartsAt,
  eventEndsAt,
}: PostState): void {
  if (isPublished && publishedAt === null) {
    throw new BadRequestException('Для опубликованной записи обязательна дата публикации');
  }

  if (eventEndsAt !== null && eventStartsAt === null) {
    throw new BadRequestException('Для даты окончания события необходимо указать дату начала');
  }

  if (
    eventStartsAt !== null &&
    eventEndsAt !== null &&
    eventEndsAt.getTime() <= eventStartsAt.getTime()
  ) {
    throw new BadRequestException('Дата окончания события должна быть позже даты начала');
  }
}
