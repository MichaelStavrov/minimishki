import type { GalleryItemDto } from './gallery.dto';

/** Новость центра или анонс разового события */
export interface PostDto {
  id: string;
  slug: string;
  title: string;

  /** Краткий анонс для карточки в ленте */
  excerpt: string | null;

  /** Очищенный на backend HTML из визуального редактора */
  contentHtml: string;

  coverUrl: string | null;

  /** Дата и время начала разового события в формате ISO 8601 */
  eventStartsAt: string | null;

  /** Дата и время окончания; всегда позже eventStartsAt */
  eventEndsAt: string | null;

  /** Свободная публичная подпись, например «5+» */
  ageLabel: string | null;

  /** Свободная публичная подпись, например «1000 ₽» или «бесплатно» */
  priceLabel: string | null;

  /** Пояснение способа записи */
  registrationLabel: string | null;

  /** Ссылка на форму, мессенджер или внешнюю страницу */
  registrationUrl: string | null;

  isPublished: boolean;

  /**
   * Дата публикации в формате ISO 8601.
   * null допустим только для неопубликованного черновика.
   * Будущая дата означает отложенную публикацию.
   */
  publishedAt: string | null;

  createdAt: string;
  updatedAt: string;

  /** Приходит только в подробной карточке новости */
  gallery?: GalleryItemDto[];
}
