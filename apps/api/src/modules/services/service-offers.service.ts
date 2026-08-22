import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { AGE_MODE, type ServiceOfferDto } from '@minimishki/shared';

import { toDomainError } from '../../common/prisma-error';
import { serialize } from '../../common/serialize';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceOfferDto } from './dto/create-service-offer.dto';
import { UpdateServiceOfferDto } from './dto/update-service-offer.dto';
import { sanitizeServiceHtml } from './services-html.sanitizer';
import { SERVICE_OFFER_SELECT } from './services.select';
import { validateOffer } from './services.validation';

const OFFER_ERROR_MESSAGES = {
  unique: 'Предложение с такими данными уже существует',
  notFound: 'Предложение не найдено',
};

function normalizeNullableText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const normalized = value.trim();
  return normalized === '' ? null : normalized;
}

function sanitizeNullableHtml(html: string | null): string | null {
  if (html === null) {
    return null;
  }

  const sanitized = sanitizeServiceHtml(html);
  return sanitized === '' ? null : sanitized;
}

@Injectable()
export class ServiceOffersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(groupId: string, dto: CreateServiceOfferDto): Promise<ServiceOfferDto> {
    await this.ensureGroupExists(groupId);

    const amount = dto.amount ?? null;
    const ageMode = dto.ageMode ?? AGE_MODE.INHERIT;
    const ageFromMonths = dto.ageFromMonths ?? null;
    const ageToMonths = dto.ageToMonths ?? null;

    validateOffer({
      priceType: dto.priceType,
      amount,
      ageMode,
      ageFromMonths,
      ageToMonths,
    });

    try {
      const offer = await this.prisma.serviceOffer.create({
        data: {
          groupId,
          title: dto.title.trim(),
          descriptionHtml:
            dto.descriptionHtml === undefined
              ? undefined
              : sanitizeNullableHtml(dto.descriptionHtml),
          imageUrl: dto.imageUrl === undefined ? undefined : normalizeNullableText(dto.imageUrl),
          priceType: dto.priceType,
          amount,
          priceUnit: dto.priceUnit === undefined ? undefined : normalizeNullableText(dto.priceUnit),
          priceNote: dto.priceNote === undefined ? undefined : normalizeNullableText(dto.priceNote),
          durationMinutes: dto.durationMinutes,
          ageMode,
          ageFromMonths,
          ageToMonths,
          ageNote: dto.ageNote === undefined ? undefined : normalizeNullableText(dto.ageNote),
          isPublished: dto.isPublished,
          sortOrder: dto.sortOrder,
        },
        select: SERVICE_OFFER_SELECT,
      });

      return serialize(offer);
    } catch (error) {
      throw toDomainError(error, OFFER_ERROR_MESSAGES);
    }
  }

  async update(id: string, dto: UpdateServiceOfferDto): Promise<ServiceOfferDto> {
    const current = await this.prisma.serviceOffer.findUnique({
      where: { id },
      select: {
        priceType: true,
        amount: true,
        ageMode: true,
        ageFromMonths: true,
        ageToMonths: true,
      },
    });

    if (!current) {
      throw new NotFoundException('Предложение не найдено');
    }

    const priceType = dto.priceType ?? current.priceType;
    const amount = dto.amount === undefined ? current.amount : dto.amount;
    const ageMode = dto.ageMode ?? current.ageMode;
    const ageFromMonths =
      dto.ageFromMonths === undefined ? current.ageFromMonths : dto.ageFromMonths;
    const ageToMonths = dto.ageToMonths === undefined ? current.ageToMonths : dto.ageToMonths;

    validateOffer({
      priceType,
      amount,
      ageMode,
      ageFromMonths,
      ageToMonths,
    });

    const data: Prisma.ServiceOfferUpdateInput = {};

    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }

    if (dto.descriptionHtml !== undefined) {
      data.descriptionHtml = sanitizeNullableHtml(dto.descriptionHtml);
    }

    if (dto.imageUrl !== undefined) {
      data.imageUrl = normalizeNullableText(dto.imageUrl);
    }

    if (dto.priceType !== undefined) {
      data.priceType = dto.priceType;
    }

    if (dto.amount !== undefined) {
      data.amount = dto.amount;
    }

    if (dto.priceUnit !== undefined) {
      data.priceUnit = normalizeNullableText(dto.priceUnit);
    }

    if (dto.priceNote !== undefined) {
      data.priceNote = normalizeNullableText(dto.priceNote);
    }

    if (dto.durationMinutes !== undefined) {
      data.durationMinutes = dto.durationMinutes;
    }

    if (dto.ageMode !== undefined) {
      data.ageMode = dto.ageMode;
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

    if (dto.isPublished !== undefined) {
      data.isPublished = dto.isPublished;
    }

    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    try {
      const offer = await this.prisma.serviceOffer.update({
        where: { id },
        data,
        select: SERVICE_OFFER_SELECT,
      });

      return serialize(offer);
    } catch (error) {
      throw toDomainError(error, OFFER_ERROR_MESSAGES);
    }
  }

  /** Предложение удаляется физически: внешних ссылок на него нет */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.serviceOffer.delete({
        where: { id },
        select: { id: true },
      });
    } catch (error) {
      throw toDomainError(error, OFFER_ERROR_MESSAGES);
    }
  }

  private async ensureGroupExists(groupId: string): Promise<void> {
    const group = await this.prisma.serviceOfferGroup.findUnique({
      where: { id: groupId },
      select: { id: true },
    });

    if (!group) {
      throw new NotFoundException('Группа предложений не найдена');
    }
  }
}
