import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { Paginated, PostDto } from '@minimishki/shared';

import { normalizeNullableText } from '../../common/normalize-nullable-text';
import { toDomainError } from '../../common/prisma-error';
import { serialize } from '../../common/serialize';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { POST_ADMIN_DETAIL_SELECT, POST_PUBLIC_DETAIL_SELECT, POST_SELECT } from './posts.select';
import { sanitizeRequiredPostHtml, validatePostState } from './posts.validation';

const POST_ERROR_MESSAGES = {
  unique: 'Публикация с таким slug уже существует',
  notFound: 'Публикация не найдена',
};

type LockedPostState = {
  isPublished: boolean;
  publishedAt: Date | null;
  eventStartsAt: Date | null;
  eventEndsAt: Date | null;
};

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Публичная лента содержит только опубликованные записи,
   * дата публикации которых уже наступила.
   */
  async findPublic({ page, pageSize }: PaginationQueryDto): Promise<Paginated<PostDto>> {
    const now = new Date();

    const where: Prisma.PostWhereInput = {
      isPublished: true,
      publishedAt: {
        lte: now,
      },
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        select: POST_SELECT,
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: serialize(items),
      total,
      page,
      pageSize,
    };
  }

  /**
   * Будущая публикация возвращает 404 так же, как черновик или отсутствующая запись:
   * публичный API не раскрывает существование ещё не опубликованного материала.
   */
  async findPublicBySlug(slug: string): Promise<PostDto> {
    const post = await this.prisma.post.findFirst({
      where: {
        slug,
        isPublished: true,
        publishedAt: {
          lte: new Date(),
        },
      },
      select: POST_PUBLIC_DETAIL_SELECT,
    });

    if (!post) {
      throw new NotFoundException('Публикация не найдена');
    }

    return serialize(post);
  }

  /** Административный список содержит опубликованные записи и черновики */
  async findAllAdmin({
    page,
    pageSize,
    search,
    isPublished,
  }: ListPostsDto): Promise<Paginated<PostDto>> {
    const where: Prisma.PostWhereInput = {
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
                excerpt: {
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
      this.prisma.post.findMany({
        where,
        select: POST_SELECT,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      items: serialize(items),
      total,
      page,
      pageSize,
    };
  }

  /** Административная карточка содержит все связанные изображения */
  async findOneAdmin(id: string): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: POST_ADMIN_DETAIL_SELECT,
    });

    if (!post) {
      throw new NotFoundException('Публикация не найдена');
    }

    return serialize(post);
  }

  async create(dto: CreatePostDto): Promise<PostDto> {
    const isPublished = dto.isPublished ?? false;

    /**
     * Текущее время подставляется только если публикацию создают сразу
     * опубликованной и поле publishedAt вообще отсутствует в запросе.
     * Явный null не маскируется и будет отклонён validatePostState.
     */
    const publishedAt =
      dto.publishedAt === undefined
        ? isPublished
          ? new Date()
          : null
        : dto.publishedAt === null
          ? null
          : new Date(dto.publishedAt);

    const eventStartsAt =
      dto.eventStartsAt === undefined || dto.eventStartsAt === null
        ? null
        : new Date(dto.eventStartsAt);

    const eventEndsAt =
      dto.eventEndsAt === undefined || dto.eventEndsAt === null ? null : new Date(dto.eventEndsAt);

    validatePostState({
      isPublished,
      publishedAt,
      eventStartsAt,
      eventEndsAt,
    });

    try {
      const post = await this.prisma.post.create({
        data: {
          slug: dto.slug,
          title: dto.title.trim(),
          excerpt: normalizeNullableText(dto.excerpt),
          contentHtml: sanitizeRequiredPostHtml(dto.contentHtml),
          coverUrl: normalizeNullableText(dto.coverUrl),
          eventStartsAt,
          eventEndsAt,
          ageLabel: normalizeNullableText(dto.ageLabel),
          priceLabel: normalizeNullableText(dto.priceLabel),
          registrationLabel: normalizeNullableText(dto.registrationLabel),
          registrationUrl: normalizeNullableText(dto.registrationUrl),
          isPublished,
          publishedAt,
        },
        select: POST_ADMIN_DETAIL_SELECT,
      });

      return serialize(post);
    } catch (error) {
      throw toDomainError(error, POST_ERROR_MESSAGES);
    }
  }

  async update(id: string, dto: UpdatePostDto): Promise<PostDto> {
    try {
      const post = await this.prisma.$transaction(async (transaction) => {
        /**
         * Блокировка не позволяет двум PATCH одновременно прочитать одно старое
         * состояние и независимо собрать несовместимые значения зависимых полей.
         */
        const [current] = await transaction.$queryRaw<LockedPostState[]>(Prisma.sql`
          SELECT "isPublished", "publishedAt", "eventStartsAt", "eventEndsAt"
          FROM "Post"
          WHERE "id" = ${id}
          FOR UPDATE
        `);

        if (!current) {
          throw new NotFoundException('Публикация не найдена');
        }

        const isPublished = dto.isPublished ?? current.isPublished;

        const eventStartsAt =
          dto.eventStartsAt === undefined
            ? current.eventStartsAt
            : dto.eventStartsAt === null
              ? null
              : new Date(dto.eventStartsAt);

        const eventEndsAt =
          dto.eventEndsAt === undefined
            ? current.eventEndsAt
            : dto.eventEndsAt === null
              ? null
              : new Date(dto.eventEndsAt);

        let publishedAt = current.publishedAt;
        let shouldUpdatePublishedAt = false;

        if (dto.publishedAt !== undefined) {
          publishedAt = dto.publishedAt === null ? null : new Date(dto.publishedAt);
          shouldUpdatePublishedAt = true;
        } else if (
          dto.isPublished === true &&
          current.isPublished === false &&
          current.publishedAt === null
        ) {
          /**
           * Первая публикация черновика без заданной даты получает текущее время.
           * При повторной публикации существующая дата сохраняется.
           */
          publishedAt = new Date();
          shouldUpdatePublishedAt = true;
        }

        validatePostState({
          isPublished,
          publishedAt,
          eventStartsAt,
          eventEndsAt,
        });

        const data: Prisma.PostUpdateInput = {};

        if (dto.slug !== undefined) {
          data.slug = dto.slug;
        }

        if (dto.title !== undefined) {
          data.title = dto.title.trim();
        }

        if (dto.excerpt !== undefined) {
          data.excerpt = normalizeNullableText(dto.excerpt);
        }

        if (dto.contentHtml !== undefined) {
          data.contentHtml = sanitizeRequiredPostHtml(dto.contentHtml);
        }

        if (dto.coverUrl !== undefined) {
          data.coverUrl = normalizeNullableText(dto.coverUrl);
        }

        if (dto.eventStartsAt !== undefined) {
          data.eventStartsAt = eventStartsAt;
        }

        if (dto.eventEndsAt !== undefined) {
          data.eventEndsAt = eventEndsAt;
        }

        if (dto.ageLabel !== undefined) {
          data.ageLabel = normalizeNullableText(dto.ageLabel);
        }

        if (dto.priceLabel !== undefined) {
          data.priceLabel = normalizeNullableText(dto.priceLabel);
        }

        if (dto.registrationLabel !== undefined) {
          data.registrationLabel = normalizeNullableText(dto.registrationLabel);
        }

        if (dto.registrationUrl !== undefined) {
          data.registrationUrl = normalizeNullableText(dto.registrationUrl);
        }

        if (dto.isPublished !== undefined) {
          data.isPublished = dto.isPublished;
        }

        if (shouldUpdatePublishedAt) {
          data.publishedAt = publishedAt;
        }

        return transaction.post.update({
          where: { id },
          data,
          select: POST_ADMIN_DETAIL_SELECT,
        });
      });

      return serialize(post);
    } catch (error) {
      throw toDomainError(error, POST_ERROR_MESSAGES);
    }
  }

  /**
   * Публикация удаляется физически.
   *
   * PostgreSQL каскадно удаляет связанные строки GalleryItem. Физические файлы
   * изображений этим запросом не удаляются: файловое хранилище — отдельный слой.
   */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.post.delete({
        where: { id },
        select: { id: true },
      });
    } catch (error) {
      throw toDomainError(error, POST_ERROR_MESSAGES);
    }
  }
}
