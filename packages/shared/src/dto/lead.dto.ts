import type { LeadStatus, Role } from '../enums';
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
  /** null у заявок, созданных до серверной фиксации согласия. */
  consentedAt: string | null;
  /** null у заявок, созданных до серверной фиксации согласия. */
  consentVersion: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;

  /** null — услуга не выбрана либо была физически удалена */
  serviceId: string | null;
  /** Приходит только при запросе с `include`; внутри тоже может быть null */
  service?: ServiceDto | null;
}

/** Заявка в административном API с внутренней заметкой сотрудников. */
export interface AdminLeadDto extends LeadDto {
  /** Email родителя виден только сотрудникам в защищённой административной части. */
  email: string | null;
  managerComment: string | null;
}

/** Неизменяемая запись о переходе заявки между статусами. */
export interface LeadStatusChangeDto {
  id: string;
  fromStatus: LeadStatus;
  toStatus: LeadStatus;
  createdAt: string;
  manager: {
    id: string;
    name: string;
    role: Role;
  };
}
