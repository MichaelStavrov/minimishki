import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Общий контракт постраничных списков: ?page=1&pageSize=20.
 * Наследуется всеми DTO списков, чтобы значения по умолчанию и потолок
 * pageSize были описаны в проекте один раз.
 */
export class PaginationQueryDto {
  /**
   * @Type нужен потому, что query-параметры приходят строками, а типы
   * TypeScript при компиляции стираются — class-transformer узнаёт целевой
   * тип только из этой стрелки. Инициализатор работает как значение
   * по умолчанию: ValidationPipe с transform создаёт экземпляр класса.
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page должен быть целым числом' })
  @Min(1, { message: 'page начинается с 1' })
  page: number = 1;

  /** Потолок 100 — защита от ?pageSize=100000, который выгребет всю таблицу разом */
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pageSize должен быть целым числом' })
  @Min(1, { message: 'pageSize не может быть меньше 1' })
  @Max(100, { message: 'pageSize не может быть больше 100' })
  pageSize: number = 20;
}
