import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';

import type { Paginated, UserDto } from '@minimishki/shared';

import { toDomainError } from '../common/prisma-error';
import { serialize } from '../common/serialize';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * Белый список колонок, уезжающих клиенту, — ровно поля UserDto.
 *
 * Prisma без select возвращает модель целиком, вместе с passwordHash. Перечисление
 * надёжнее, чем удаление поля после выборки: новая чувствительная колонка в схеме
 * не утечёт сама, пока её сюда осознанно не впишут.
 *
 * satisfies, а не аннотация типа: аннотация расширила бы true до boolean,
 * и Prisma перестала бы выводить форму результата.
 */
const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

/** То же самое плюс хеш — единственный набор, которым пользуется аутентификация */
const USER_AUTH_SELECT = {
  ...USER_SELECT,
  passwordHash: true,
} satisfies Prisma.UserSelect;

/** Форма выводится из самого select: правка списка полей меняет тип автоматически */
export type UserWithHash = Prisma.UserGetPayload<{ select: typeof USER_AUTH_SELECT }>;

const USER_ERROR_MESSAGES = {
  unique: 'Пользователь с таким email уже существует',
  notFound: 'Пользователь не найден',
};

/**
 * PostgreSQL сравнивает строки с учётом регистра: Ivan@mail.ru и ivan@mail.ru —
 * разные значения, уникальный индекс их пропустит. Приводим и при записи,
 * и при поиске: нормализация только на одной стороне сделала бы вход невозможным.
 */
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /** Постраничный список; фильтр по роли опирается на @@index([role]) в схеме */
  async findAll({ page, pageSize, role }: ListUsersDto): Promise<Paginated<UserDto>> {
    const where: Prisma.UserWhereInput = role ? { role } : {};

    // Обе величины берутся из одного снимка данных: без транзакции между запросами
    // могло бы пройти удаление, и total разошёлся бы с длиной items.
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items: serialize(items), total, page, pageSize };
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return serialize(user);
  }

  async create(dto: CreateUserDto): Promise<UserDto> {
    // Открытый пароль дальше этой строки не живёт: в data уходит только хеш.
    const passwordHash = await argon2.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: normalizeEmail(dto.email),
          passwordHash,
          name: dto.name,
          role: dto.role,
        },
        select: USER_SELECT,
      });

      return serialize(user);
    } catch (error) {
      throw toDomainError(error, USER_ERROR_MESSAGES);
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDto> {
    // Поля перечисляются вручную, без ...dto: в DTO есть password, а колонки
    // password в базе нет — есть passwordHash. Расплющивание уронило бы запрос.
    const data: Prisma.UserUpdateInput = {};

    if (dto.email !== undefined) {
      data.email = normalizeEmail(dto.email);
    }

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.role !== undefined) {
      data.role = dto.role;
    }

    // Без этой ветки открытый пароль лёг бы в колонку хеша: вход перестал бы
    // работать, а база хранила бы пароли в открытом виде.
    if (dto.password !== undefined) {
      data.passwordHash = await argon2.hash(dto.password);
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
        select: USER_SELECT,
      });

      return serialize(user);
    } catch (error) {
      throw toDomainError(error, USER_ERROR_MESSAGES);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      throw toDomainError(error, USER_ERROR_MESSAGES);
    }
  }

  /**
   * Единственный метод, отдающий passwordHash. Имя громкое намеренно — вызов видно
   * на ревью. Нужен AuthService, контроллер его не вызывает.
   *
   * Модель целиком не возвращается: белый список защищает и от полей, которые
   * появятся в схеме позже, — иначе они уедут в ответ через /auth/me.
   */
  findByEmailWithHash(email: string): Promise<UserWithHash | null> {
    return this.prisma.user.findUnique({
      where: { email: normalizeEmail(email) },
      select: USER_AUTH_SELECT,
    });
  }
}
