import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { GalleryItemDto, Paginated } from '@minimishki/shared';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { normalizeNullableText } from '../../common/normalize-nullable-text';
import { toDomainError } from '../../common/prisma-error';
import { serialize } from '../../common/serialize';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import {
  GALLERY_OWNER_TYPE,
  type GalleryOwnerType,
  ListGalleryItemsDto,
} from './dto/list-gallery-items.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { GALLERY_ITEM_SELECT } from './gallery-items.select';
import {
  lockGalleryItemOwner,
  validateGalleryItemOwner,
  type GalleryItemOwner,
} from './gallery-items.validation';

const GALLERY_ITEM_ERROR_MESSAGES = {
  unique: 'Фотография с такими данными уже существует',
  notFound: 'Фотография не найдена',
};

type LockedGalleryItemOwner = {
  postId: string | null;
  serviceId: string | null;
};

function getOwnerWhere(ownerType: GalleryOwnerType | undefined): Prisma.GalleryItemWhereInput {
  switch (ownerType) {
    case GALLERY_OWNER_TYPE.GENERAL:
      return {
        postId: null,
        serviceId: null,
      };

    case GALLERY_OWNER_TYPE.POST:
      return {
        postId: {
          not: null,
        },
      };

    case GALLERY_OWNER_TYPE.SERVICE:
      return {
        serviceId: {
          not: null,
        },
      };

    default:
      return {};
  }
}

@Injectable()
export class GalleryItemsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Публичный список содержит только опубликованные фотографии общей галереи.
   *
   * Изображения публикаций и услуг выдаются внутри карточек соответствующих
   * сущностей и здесь не дублируются.
   */
  async findPublic({ page, pageSize }: PaginationQueryDto): Promise<Paginated<GalleryItemDto>> {
    const where: Prisma.GalleryItemWhereInput = {
      isPublished: true,
      postId: null,
      serviceId: null,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.galleryItem.findMany({
        where,
        select: GALLERY_ITEM_SELECT,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.galleryItem.count({ where }),
    ]);

    return {
      items: serialize(items),
      total,
      page,
      pageSize,
    };
  }

  /** Административный список содержит фотографии всех типов владельцев */
  async findAllAdmin({
    page,
    pageSize,
    search,
    isPublished,
    ownerType,
  }: ListGalleryItemsDto): Promise<Paginated<GalleryItemDto>> {
    const where: Prisma.GalleryItemWhereInput = {
      ...getOwnerWhere(ownerType),
      ...(isPublished === undefined ? {} : { isPublished }),
      ...(search
        ? {
            OR: [
              {
                url: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                alt: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
              {
                caption: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.galleryItem.findMany({
        where,
        select: GALLERY_ITEM_SELECT,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.galleryItem.count({ where }),
    ]);

    return {
      items: serialize(items),
      total,
      page,
      pageSize,
    };
  }

  async findOneAdmin(id: string): Promise<GalleryItemDto> {
    const galleryItem = await this.prisma.galleryItem.findUnique({
      where: { id },
      select: GALLERY_ITEM_SELECT,
    });

    if (!galleryItem) {
      throw new NotFoundException('Фотография не найдена');
    }

    return serialize(galleryItem);
  }

  async create(dto: CreateGalleryItemDto): Promise<GalleryItemDto> {
    const owner: GalleryItemOwner = {
      postId: dto.postId ?? null,
      serviceId: dto.serviceId ?? null,
    };

    try {
      const galleryItem = await this.prisma.$transaction(async (transaction) => {
        /**
         * Блокировка владельца не позволяет удалить его между проверкой
         * существования и созданием внешнего ключа GalleryItem.
         */
        await lockGalleryItemOwner(transaction, owner);

        return transaction.galleryItem.create({
          data: {
            url: dto.url,
            alt: normalizeNullableText(dto.alt),
            caption: normalizeNullableText(dto.caption),
            isPublished: dto.isPublished,
            sortOrder: dto.sortOrder,
            postId: owner.postId,
            serviceId: owner.serviceId,
          },
          select: GALLERY_ITEM_SELECT,
        });
      });

      return serialize(galleryItem);
    } catch (error) {
      throw toDomainError(error, GALLERY_ITEM_ERROR_MESSAGES);
    }
  }

  async update(id: string, dto: UpdateGalleryItemDto): Promise<GalleryItemDto> {
    try {
      const galleryItem = await this.prisma.$transaction(async (transaction) => {
        /**
         * Два конкурентных PATCH не могут прочитать одно старое состояние
         * владельца и независимо записать несовместимый результат.
         */
        const [current] = await transaction.$queryRaw<LockedGalleryItemOwner[]>(Prisma.sql`
          SELECT "postId", "serviceId"
          FROM "GalleryItem"
          WHERE "id" = ${id}
          FOR UPDATE
        `);

        if (!current) {
          throw new NotFoundException('Фотография не найдена');
        }

        const owner: GalleryItemOwner = {
          postId: dto.postId === undefined ? current.postId : dto.postId,
          serviceId: dto.serviceId === undefined ? current.serviceId : dto.serviceId,
        };

        const ownerChanged =
          owner.postId !== current.postId || owner.serviceId !== current.serviceId;

        /**
         * Повторная проверка нужна после объединения PATCH с сохранённой строкой.
         * DTO видит только поля текущего HTTP-запроса и не знает состояние БД.
         */
        validateGalleryItemOwner(owner);

        /**
         * Неизменившийся владелец уже защищён внешним ключом. Его повторная
         * блокировка создала бы обратный порядок GalleryItem → Post относительно
         * каскадного удаления Post → GalleryItem и риск взаимной блокировки.
         */
        if (ownerChanged) {
          await lockGalleryItemOwner(transaction, owner);
        }

        const data: Prisma.GalleryItemUncheckedUpdateInput = {};

        if (dto.url !== undefined) {
          data.url = dto.url;
        }

        if (dto.alt !== undefined) {
          data.alt = normalizeNullableText(dto.alt);
        }

        if (dto.caption !== undefined) {
          data.caption = normalizeNullableText(dto.caption);
        }

        if (dto.isPublished !== undefined) {
          data.isPublished = dto.isPublished;
        }

        if (dto.sortOrder !== undefined) {
          data.sortOrder = dto.sortOrder;
        }

        if (dto.postId !== undefined) {
          data.postId = dto.postId;
        }

        if (dto.serviceId !== undefined) {
          data.serviceId = dto.serviceId;
        }

        return transaction.galleryItem.update({
          where: { id },
          data,
          select: GALLERY_ITEM_SELECT,
        });
      });

      return serialize(galleryItem);
    } catch (error) {
      throw toDomainError(error, GALLERY_ITEM_ERROR_MESSAGES);
    }
  }

  /**
   * Удаляется только строка метаданных GalleryItem.
   *
   * Физический файл по сохранённому URL не удаляется: файловое хранилище
   * будет реализовано отдельной задачей.
   */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.galleryItem.delete({
        where: { id },
        select: { id: true },
      });
    } catch (error) {
      throw toDomainError(error, GALLERY_ITEM_ERROR_MESSAGES);
    }
  }
}
