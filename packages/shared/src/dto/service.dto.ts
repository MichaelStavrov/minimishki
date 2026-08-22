import type { AgeMode, DayOfWeek, PriceType, ScheduleType } from '../enums';
import type { GalleryItemDto } from './gallery.dto';
import type { TeacherDto } from './teacher.dto';

/** Конкретный тариф, программа или вариант услуги */
export interface ServiceOfferDto {
  id: string;
  groupId: string;
  title: string;
  /** Очищенный HTML из визуального редактора */
  descriptionHtml: string | null;
  imageUrl: string | null;
  priceType: PriceType;
  /** Цена в копейках; используется только для FIXED и FROM */
  amount: number | null;
  /** Например: «за час», «за ребёнка», «до 10 человек» */
  priceUnit: string | null;
  priceNote: string | null;
  durationMinutes: number | null;
  ageMode: AgeMode;
  ageFromMonths: number | null;
  ageToMonths: number | null;
  ageNote: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Группа предложений внутри услуги: например, «Абонементы» */
export interface ServiceOfferGroupDto {
  id: string;
  serviceId: string;
  title: string;
  /** Очищенный HTML из визуального редактора */
  descriptionHtml: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;

  /** Приходит только при запросе с `include` */
  offers?: ServiceOfferDto[];
}

/** Регулярное расписание либо вариант «по согласованию» */
export interface ServiceScheduleDto {
  id: string;
  serviceId: string;
  scheduleType: ScheduleType;
  daysOfWeek: DayOfWeek[];
  /** Локальное время центра в формате HH:mm */
  startTime: string | null;
  /** Локальное время центра в формате HH:mm */
  endTime: string | null;
  /** Начало сезонного периода; PostgreSQL date сериализуется в строку */
  validFrom: string | null;
  /** Конец сезонного периода; PostgreSQL date сериализуется в строку */
  validUntil: string | null;
  /** Публичная подпись, обязательная для ON_REQUEST */
  label: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/** Публичная страница услуги детского центра */
export interface ServiceDto {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  /** Очищенный HTML из визуального редактора */
  contentHtml: string;
  ageFromMonths: number | null;
  ageToMonths: number | null;
  ageNote: string | null;
  coverUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isPublished: boolean;
  archivedAt: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;

  /** Приходит только при запросе с `include` */
  offerGroups?: ServiceOfferGroupDto[];
  /** Приходит только при запросе с `include` */
  schedules?: ServiceScheduleDto[];
  /** Приходит только при запросе с `include` */
  teachers?: TeacherDto[];
  /** Приходит только при запросе с `include` */
  gallery?: GalleryItemDto[];
}
