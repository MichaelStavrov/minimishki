/** Фотография новости, услуги либо общей галереи */
export interface GalleryItemDto {
  id: string;
  url: string;
  /** alt-текст для доступности и SEO */
  alt: string | null;
  /** Видимая подпись под фотографией */
  caption: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;

  /** null — фотография не относится к новости */
  postId: string | null;
  /** null — фотография не относится к услуге */
  serviceId: string | null;
}
