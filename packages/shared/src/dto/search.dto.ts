/** Тип публичного материала, найденного через поиск. */
export type SearchResultType = 'SERVICE' | 'POST';

/** Одна найденная публичная услуга или новость. */
export interface SearchResultDto {
  type: SearchResultType;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
}

/** Ответ публичного поиска. */
export interface SearchResponseDto {
  query: string;
  items: SearchResultDto[];
  total: number;
}
