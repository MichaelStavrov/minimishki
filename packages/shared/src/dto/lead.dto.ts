import type { LeadStatus } from '../enums';
import type { ServiceDto } from './service.dto';

/** Заявка с публичной формы сайта */
export interface LeadDto {
  id: string;
  /** Имя родителя */
  name: string;
  phone: string;
  childName: string | null;
  childAge: number | null;
  comment: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;

  /** null — услуга не выбрана либо была физически удалена */
  serviceId: string | null;
  /** Приходит только при запросе с `include`; внутри тоже может быть null */
  service?: ServiceDto | null;
}
