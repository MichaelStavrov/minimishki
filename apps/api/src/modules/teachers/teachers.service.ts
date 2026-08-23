import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { Paginated, TeacherDto } from '@minimishki/shared';

import { normalizeNullableText } from '../../common/normalize-nullable-text';
import { toDomainError } from '../../common/prisma-error';
import { serialize } from '../../common/serialize';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { ListTeachersDto } from './dto/list-teachers.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import {
  TEACHER_ADMIN_DETAIL_SELECT,
  TEACHER_PUBLIC_DETAIL_SELECT,
  TEACHER_SELECT,
} from './teachers.select';

const TEACHER_ERROR_MESSAGES = {
  unique: 'Педагог с таким slug уже существует',
  notFound: 'Педагог или одна из связанных услуг не найдены',
};

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Публичный список всегда ограничен опубликованными и неархивными педагогами.
   * Клиент не может изменить эти фильтры query-параметрами.
   */
  async findPublic({ page, pageSize }: PaginationQueryDto): Promise<Paginated<TeacherDto>> {
    const where: Prisma.TeacherWhereInput = {
      isPublished: true,
      archivedAt: null,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.teacher.findMany({
        where,
        select: TEACHER_SELECT,
        orderBy: [{ sortOrder: 'asc' }, { fullName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return {
      items: serialize(items),
      total,
      page,
      pageSize,
    };
  }

  /** Публичная карточка включает только опубликованные неархивные услуги */
  async findPublicBySlug(slug: string): Promise<TeacherDto> {
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        slug,
        isPublished: true,
        archivedAt: null,
      },
      select: TEACHER_PUBLIC_DETAIL_SELECT,
    });

    if (!teacher) {
      throw new NotFoundException('Педагог не найден');
    }

    return serialize(teacher);
  }

  /** Административный список может фильтровать публикацию и включать архив */
  async findAllAdmin({
    page,
    pageSize,
    search,
    isPublished,
    includeArchived,
  }: ListTeachersDto): Promise<Paginated<TeacherDto>> {
    const where: Prisma.TeacherWhereInput = {
      ...(includeArchived ? {} : { archivedAt: null }),
      ...(isPublished === undefined ? {} : { isPublished }),
      ...(search
        ? {
            OR: [
              {
                fullName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                position: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                slug: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.teacher.findMany({
        where,
        select: TEACHER_SELECT,
        orderBy: [{ sortOrder: 'asc' }, { fullName: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.teacher.count({ where }),
    ]);

    return {
      items: serialize(items),
      total,
      page,
      pageSize,
    };
  }

  /** Административная карточка содержит все связанные услуги */
  async findOneAdmin(id: string): Promise<TeacherDto> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      select: TEACHER_ADMIN_DETAIL_SELECT,
    });

    if (!teacher) {
      throw new NotFoundException('Педагог не найден');
    }

    return serialize(teacher);
  }

  async create(dto: CreateTeacherDto): Promise<TeacherDto> {
    const serviceIds = dto.serviceIds ?? [];

    await this.ensureServicesExist(serviceIds);

    try {
      const teacher = await this.prisma.teacher.create({
        data: {
          slug: dto.slug,
          fullName: dto.fullName.trim(),
          position: dto.position.trim(),
          bio: normalizeNullableText(dto.bio),
          photoUrl: normalizeNullableText(dto.photoUrl),
          isPublished: dto.isPublished,
          sortOrder: dto.sortOrder,
          services:
            serviceIds.length > 0
              ? {
                  connect: serviceIds.map((id) => ({ id })),
                }
              : undefined,
        },
        select: TEACHER_ADMIN_DETAIL_SELECT,
      });

      return serialize(teacher);
    } catch (error) {
      throw toDomainError(error, TEACHER_ERROR_MESSAGES);
    }
  }

  async update(id: string, dto: UpdateTeacherDto): Promise<TeacherDto> {
    const current = await this.prisma.teacher.findUnique({
      where: { id },
      select: { archivedAt: true },
    });

    if (!current) {
      throw new NotFoundException('Педагог не найден');
    }

    if (current.archivedAt !== null && dto.isPublished === true) {
      throw new BadRequestException('Архивного педагога нельзя опубликовать до восстановления');
    }

    if (dto.serviceIds !== undefined) {
      await this.ensureServicesExist(dto.serviceIds);
    }

    const data: Prisma.TeacherUpdateInput = {};

    if (dto.slug !== undefined) {
      data.slug = dto.slug;
    }

    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName.trim();
    }

    if (dto.position !== undefined) {
      data.position = dto.position.trim();
    }

    if (dto.bio !== undefined) {
      data.bio = normalizeNullableText(dto.bio);
    }

    if (dto.photoUrl !== undefined) {
      data.photoUrl = normalizeNullableText(dto.photoUrl);
    }

    if (dto.isPublished !== undefined) {
      data.isPublished = dto.isPublished;
    }

    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    if (dto.serviceIds !== undefined) {
      data.services = {
        set: dto.serviceIds.map((serviceId) => ({ id: serviceId })),
      };
    }

    try {
      const teacher = await this.prisma.teacher.update({
        where: { id },
        data,
        select: TEACHER_ADMIN_DETAIL_SELECT,
      });

      return serialize(teacher);
    } catch (error) {
      throw toDomainError(error, TEACHER_ERROR_MESSAGES);
    }
  }

  /**
   * Обычное удаление архивирует педагога и снимает публикацию.
   * Связи с услугами сохраняются для возможного восстановления.
   */
  async archive(id: string): Promise<void> {
    const current = await this.prisma.teacher.findUnique({
      where: { id },
      select: { archivedAt: true },
    });

    if (!current) {
      throw new NotFoundException('Педагог не найден');
    }

    // Повторный DELETE идемпотентен и сохраняет исходное время архивирования.
    if (current.archivedAt !== null) {
      return;
    }

    try {
      await this.prisma.teacher.update({
        where: { id },
        data: {
          isPublished: false,
          archivedAt: new Date(),
        },
        select: { id: true },
      });
    } catch (error) {
      throw toDomainError(error, TEACHER_ERROR_MESSAGES);
    }
  }

  /**
   * Восстановленный педагог остаётся черновиком: публикация требует
   * отдельного осознанного действия администратора.
   */
  async restore(id: string): Promise<TeacherDto> {
    const current = await this.prisma.teacher.findUnique({
      where: { id },
      select: { archivedAt: true },
    });

    if (!current) {
      throw new NotFoundException('Педагог не найден');
    }

    if (current.archivedAt === null) {
      throw new BadRequestException('Педагог не находится в архиве');
    }

    try {
      const teacher = await this.prisma.teacher.update({
        where: { id },
        data: {
          archivedAt: null,
          isPublished: false,
        },
        select: TEACHER_ADMIN_DETAIL_SELECT,
      });

      return serialize(teacher);
    } catch (error) {
      throw toDomainError(error, TEACHER_ERROR_MESSAGES);
    }
  }

  private async ensureServicesExist(serviceIds: string[]): Promise<void> {
    if (serviceIds.length === 0) {
      return;
    }

    const existingServicesCount = await this.prisma.service.count({
      where: {
        id: {
          in: serviceIds,
        },
      },
    });

    if (existingServicesCount !== serviceIds.length) {
      throw new NotFoundException('Одна или несколько услуг не найдены');
    }
  }
}
