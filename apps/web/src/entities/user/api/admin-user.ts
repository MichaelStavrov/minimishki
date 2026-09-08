import type { Paginated, Role, UserDto } from '@minimishki/shared';

import { adminApiRequest } from '@/shared/api/admin';

export type AdminUsersQuery = {
  page: number;
  pageSize: number;
  role?: Role;
};

export type CreateUserValues = {
  email: string;
  name: string;
  password: string;
  role: Role;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

/** Получает список учётных записей; маршрут доступен только главному менеджеру. */
export function getAdminUsers(query: AdminUsersQuery): Promise<Paginated<UserDto>> {
  return required(
    adminApiRequest<Paginated<UserDto>>('/users', { query }),
    'Сервер вернул пустой ответ вместо списка пользователей.',
  );
}

/** Создаёт учётную запись с выбранной менеджером ролью. */
export function createUser(values: CreateUserValues): Promise<UserDto> {
  return required(
    adminApiRequest<UserDto>('/users', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(values),
    }),
    'Сервер не вернул созданного пользователя.',
  );
}

/** Меняет только роль: профиль и пароль не входят в текущий интерфейс. */
export function updateUserRole(id: string, role: Role): Promise<UserDto> {
  return required(
    adminApiRequest<UserDto>(`/users/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ role }),
    }),
    'Сервер не вернул сохранённого пользователя.',
  );
}

async function required<T>(promise: Promise<T | undefined>, errorMessage: string): Promise<T> {
  const response = await promise;

  if (response === undefined) throw new Error(errorMessage);

  return response;
}
