import type { PriceType } from '../enums';

/** Позиция праздничного прайса */
export interface PartyItemDto {
  id: string;
  categoryId: string;
  title: string;
  descriptionHtml: string | null;
  priceType: PriceType;
  amount: number | null;
  priceUnit: string | null;
  priceNote: string | null;
  durationMinutes: number | null;
  ageLabel: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Категория праздничного прайса вместе с опубликованными позициями */
export interface PartyCategoryDto {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  items?: PartyItemDto[];
}
