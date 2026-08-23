import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { Paginated, ServiceDto } from '@minimishki/shared';

import { normalizeNullableText } from '../../common/normalize-nullable-text';
import { toDomainError } from '../../common/prisma-error';
import { serialize } from '../../common/serialize';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListServicesDto } from './dto/list-services.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { sanitizeServiceHtml } from './services-html.sanitizer';
import {
  SERVICE_ADMIN_DETAIL_SELECT,
  SERVICE_PUBLIC_DETAIL_SELECT,
  SERVICE_SELECT,
} from './services.select';
import { validateAgeRange } from './services.validation';

const SERVICE_ERROR_MESSAGES = {
  unique: 'Услуга с таким slug уже существует',
  notFound: 'Услуга или один из связанных педагогов не найдены',
};

function sanitizeRequiredHtml(html: string): string {
  const sanitized = sanitizeServiceHtml(html);

  if (sanitized === '') {
    throw new BadRequestException('Содержимое услуги не может быть пустым после очистки HTML');
  }

  return sanitized;
}

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Публичный список всегда ограничен опубликованными и неархивными услугами.
   * Клиент не может изменить эти фильтры query-параметрами.
   */
  async findPublic({ page, pageSize }: PaginationQueryDto): Promise<Paginated<ServiceDto>> {
    const where: Prisma.ServiceWhereInput = {
      isPublished: true,
      archivedAt: null,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        select: SERVICE_SELECT,
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      items: serialize(items),
      total,
      page,
      pageSize,
    };
  }

  /** Публичная карточка включает только опубликованные вложенные записи */
  async findPublicBySlug(slug: string): Promise<ServiceDto> {
    const service = await this.prisma.service.findFirst({
      where: {
        slug,
        isPublished: true,
        archivedAt: null,
      },
      select: SERVICE_PUBLIC_DETAIL_SELECT,
    });

    if (!service) {
      throw new NotFoundException('Услуга не найдена');
    }

    return serialize(service);
  }

  /** Административный список может фильтровать публикацию и включать архив */
  async findAllAdmin({
    page,
    pageSize,
    search,
    isPublished,
    includeArchived,
  }: ListServicesDto): Promise<Paginated<ServiceDto>> {
    const where: Prisma.ServiceWhereInput = {
      ...(includeArchived ? {} : { archivedAt: null }),
      ...(isPublished === undefined ? {} : { isPublished }),
      ...(search
        ? {
            OR: [
              {
                title: {
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
      this.prisma.service.findMany({
        where,
        select: SERVICE_SELECT,
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      items: serialize(items),
      total,
      page,
      pageSize,
    };
  }

  /** Административная карточка содержит черновики вложенных записей */
  async findOneAdmin(id: string): Promise<ServiceDto> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: SERVICE_ADMIN_DETAIL_SELECT,
    });

    if (!service) {
      throw new NotFoundException('Услуга не найдена');
    }

    return serialize(service);
  }

  async create(dto: CreateServiceDto): Promise<ServiceDto> {
    const ageFromMonths = dto.ageFromMonths ?? null;
    const ageToMonths = dto.ageToMonths ?? null;
    const teacherIds = dto.teacherIds ?? [];

    validateAgeRange({ ageFromMonths, ageToMonths });
    await this.ensureTeachersExist(teacherIds);

    try {
      const service = await this.prisma.service.create({
        data: {
          slug: dto.slug,
          title: dto.title.trim(),
          summary: normalizeNullableText(dto.summary),
          contentHtml: sanitizeRequiredHtml(dto.contentHtml),
          ageFromMonths,
          ageToMonths,
          ageNote: normalizeNullableText(dto.ageNote),
          coverUrl: normalizeNullableText(dto.coverUrl),
          seoTitle: normalizeNullableText(dto.seoTitle),
          seoDescription: normalizeNullableText(dto.seoDescription),
          isPublished: dto.isPublished,
          sortOrder: dto.sortOrder,
          teachers:
            teacherIds.length > 0
              ? {
                  connect: teacherIds.map((id) => ({ id })),
                }
              : undefined,
        },
        select: SERVICE_ADMIN_DETAIL_SELECT,
      });

      return serialize(service);
    } catch (error) {
      throw toDomainError(error, SERVICE_ERROR_MESSAGES);
    }
  }

  async update(id: string, dto: UpdateServiceDto): Promise<ServiceDto> {
    const current = await this.prisma.service.findUnique({
      where: { id },
      select: {
        ageFromMonths: true,
        ageToMonths: true,
        archivedAt: true,
      },
    });

    if (!current) {
      throw new NotFoundException('Услуга не найдена');
    }

    const ageFromMonths =
      dto.ageFromMonths === undefined ? current.ageFromMonths : dto.ageFromMonths;
    const ageToMonths = dto.ageToMonths === undefined ? current.ageToMonths : dto.ageToMonths;

    validateAgeRange({ ageFromMonths, ageToMonths });

    if (current.archivedAt !== null && dto.isPublished === true) {
      throw new BadRequestException('Архивную услугу нельзя опубликовать до восстановления');
    }

    if (dto.teacherIds !== undefined) {
      await this.ensureTeachersExist(dto.teacherIds);
    }

    const data: Prisma.ServiceUpdateInput = {};

    if (dto.slug !== undefined) {
      data.slug = dto.slug;
    }

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }

    if (dto.summary !== undefined) {
      data.summary = normalizeNullableText(dto.summary);
    }

    if (dto.contentHtml !== undefined) {
      data.contentHtml = sanitizeRequiredHtml(dto.contentHtml);
    }

    if (dto.ageFromMonths !== undefined) {
      data.ageFromMonths = dto.ageFromMonths;
    }

    if (dto.ageToMonths !== undefined) {
      data.ageToMonths = dto.ageToMonths;
    }

    if (dto.ageNote !== undefined) {
      data.ageNote = normalizeNullableText(dto.ageNote);
    }

    if (dto.coverUrl !== undefined) {
      data.coverUrl = normalizeNullableText(dto.coverUrl);
    }

    if (dto.seoTitle !== undefined) {
      data.seoTitle = normalizeNullableText(dto.seoTitle);
    }

    if (dto.seoDescription !== undefined) {
      data.seoDescription = normalizeNullableText(dto.seoDescription);
    }

    if (dto.isPublished !== undefined) {
      data.isPublished = dto.isPublished;
    }

    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    if (dto.teacherIds !== undefined) {
      data.teachers = {
        set: dto.teacherIds.map((teacherId) => ({ id: teacherId })),
      };
    }

    try {
      const service = await this.prisma.service.update({
        where: { id },
        data,
        select: SERVICE_ADMIN_DETAIL_SELECT,
      });

      return serialize(service);
    } catch (error) {
      throw toDomainError(error, SERVICE_ERROR_MESSAGES);
    }
  }

  /**
   * Обычное удаление архивирует услугу и снимает публикацию.
   * Связи, вложенные записи и заявки сохраняются.
   */
  async archive(id: string): Promise<void> {
    const current = await this.prisma.service.findUnique({
      where: { id },
      select: { archivedAt: true },
    });

    if (!current) {
      throw new NotFoundException('Услуга не найдена');
    }

    // Повторный DELETE идемпотентен и сохраняет исходное время архивирования.
    if (current.archivedAt !== null) {
      return;
    }

    try {
      await this.prisma.service.update({
        where: { id },
        data: {
          isPublished: false,
          archivedAt: new Date(),
        },
        select: { id: true },
      });
    } catch (error) {
      throw toDomainError(error, SERVICE_ERROR_MESSAGES);
    }
  }

  /**
   * Восстановленная услуга остаётся черновиком: публикация требует
   * отдельного осознанного действия администратора.
   */
  async restore(id: string): Promise<ServiceDto> {
    const current = await this.prisma.service.findUnique({
      where: { id },
      select: { archivedAt: true },
    });

    if (!current) {
      throw new NotFoundException('Услуга не найдена');
    }

    if (current.archivedAt === null) {
      throw new BadRequestException('Услуга не находится в архиве');
    }

    try {
      const service = await this.prisma.service.update({
        where: { id },
        data: {
          archivedAt: null,
          isPublished: false,
        },
        select: SERVICE_ADMIN_DETAIL_SELECT,
      });

      return serialize(service);
    } catch (error) {
      throw toDomainError(error, SERVICE_ERROR_MESSAGES);
    }
  }

  private async ensureTeachersExist(teacherIds: string[]): Promise<void> {
    if (teacherIds.length === 0) {
      return;
    }

    const existingTeachersCount = await this.prisma.teacher.count({
      where: {
        id: {
          in: teacherIds,
        },
      },
    });

    if (existingTeachersCount !== teacherIds.length) {
      throw new NotFoundException('Один или несколько педагогов не найдены');
    }
  }
}
