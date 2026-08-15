/** Фотография: либо привязана к новости, либо лежит в общей галерее */
export interface GalleryItemDto {
  id: string;
  url: string;
  /** alt-текст: SEO и доступность */
  alt: string | null;
  sortOrder: number;
  createdAt: string;
  /** null — фото из общей галереи, не относится к новости */
  postId: string | null;
}
