import type { GalleryItemDto } from './gallery.dto';

/** Новость центра */
export interface PostDto {
  id: string;
  slug: string;
  title: string;
  /** Краткий анонс для карточки в ленте */
  excerpt: string | null;
  content: string;
  coverUrl: string | null;
  isPublished: boolean;
  /** null, пока новость не опубликована */
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;

  /** Приходит только при запросе с `include` */
  gallery?: GalleryItemDto[];
}
