/** Обёртка для любой коллекции с пагинацией: `?page=1&pageSize=20` */
export interface Paginated<T> {
  items: T[];
  /** Всего записей, подходящих под фильтр, а не в текущей странице */
  total: number;
  page: number;
  pageSize: number;
}

/** Стандартный формат ошибки Nest — свой не изобретаем */
export interface ApiErrorDto {
  statusCode: number;
  /** Массив приходит от ValidationPipe: по строке на каждое непрошедшее поле */
  message: string | string[];
  error: string;
}
