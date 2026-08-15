import type { Role } from '../enums';

/** Пользователь в ответах API. `passwordHash` не входит сюда никогда */
export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}
