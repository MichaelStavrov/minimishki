import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { ServiceOfferGroupDto } from '@minimishki/shared';

import { toDomainError } from '../../common/prisma-error';
import { serialize } from '../../common/serialize';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceOfferGroupDto } from './dto/create-service-offer-group.dto';
import { UpdateServiceOfferGroupDto } from './dto/update-service-offer-group.dto';
import { sanitizeServiceHtml } from './services-html.sanitizer';
import { SERVICE_OFFER_GROUP_SELECT } from './services.select';

const OFFER_GROUP_ERROR_MESSAGES = {
  unique: 'Группа предложений с такими данными уже существует',
  notFound: 'Группа предложений не найдена',
};

function sanitizeNullableHtml(html: string | null): string | null {
  if (html === null) {
    return null;
  }

  const sanitized = sanitizeServiceHtml(html);
  return sanitized === '' ? null : sanitized;
}

@Injectable()
export class ServiceOfferGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(serviceId: string, dto: CreateServiceOfferGroupDto): Promise<ServiceOfferGroupDto> {
    await this.ensureServiceExists(serviceId);

    try {
      const group = await this.prisma.serviceOfferGroup.create({
        data: {
          serviceId,
          title: dto.title.trim(),
          descriptionHtml:
            dto.descriptionHtml === undefined
              ? undefined
              : sanitizeNullableHtml(dto.descriptionHtml),
          isPublished: dto.isPublished,
          sortOrder: dto.sortOrder,
        },
        select: SERVICE_OFFER_GROUP_SELECT,
      });

      return serialize(group);
    } catch (error) {
      throw toDomainError(error, OFFER_GROUP_ERROR_MESSAGES);
    }
  }

  async update(id: string, dto: UpdateServiceOfferGroupDto): Promise<ServiceOfferGroupDto> {
    const data: Prisma.ServiceOfferGroupUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }

    if (dto.descriptionHtml !== undefined) {
      data.descriptionHtml = sanitizeNullableHtml(dto.descriptionHtml);
    }

    if (dto.isPublished !== undefined) {
      data.isPublished = dto.isPublished;
    }

    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    try {
      const group = await this.prisma.serviceOfferGroup.update({
        where: { id },
        data,
        select: SERVICE_OFFER_GROUP_SELECT,
      });

      return serialize(group);
    } catch (error) {
      throw toDomainError(error, OFFER_GROUP_ERROR_MESSAGES);
    }
  }

  /**
   * Удаление физическое: группа не имеет внешних ссылок, а её предложения
   * удаляются ограничением Cascade в PostgreSQL.
   */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.serviceOfferGroup.delete({
        where: { id },
        select: { id: true },
      });
    } catch (error) {
      throw toDomainError(error, OFFER_GROUP_ERROR_MESSAGES);
    }
  }

  private async ensureServiceExists(serviceId: string): Promise<void> {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true },
    });

    if (!service) {
      throw new NotFoundException('Услуга не найдена');
    }
  }
}
