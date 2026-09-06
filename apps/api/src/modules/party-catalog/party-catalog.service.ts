import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import type { PartyCategoryDto, PartyItemDto } from '@minimishki/shared';

import { sanitizeEditorHtml } from '../../common/editor-html.sanitizer';
import { serialize } from '../../common/serialize';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePartyCategoryDto } from './dto/create-party-category.dto';
import { UpdatePartyCategoryDto } from './dto/update-party-category.dto';
import { CreatePartyItemDto } from './dto/create-party-item.dto';
import { UpdatePartyItemDto } from './dto/update-party-item.dto';

@Injectable()
export class PartyCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic(): Promise<PartyCategoryDto[]> {
    const categories = await this.prisma.partyCategory.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      include: {
        items: {
          where: { isPublished: true },
          orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        },
      },
    });

    return serialize(
      categories.map((category) => ({
        ...category,
        items: category.items.map((item) => ({
          ...item,
          descriptionHtml:
            item.descriptionHtml === null ? null : sanitizeEditorHtml(item.descriptionHtml),
        })),
      })),
    );
  }

  async create(dto: CreatePartyCategoryDto): Promise<PartyCategoryDto> {
    return serialize(
      await this.prisma.partyCategory.create({
        data: {
          slug: dto.slug,
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          isPublished: dto.isPublished ?? false,
          sortOrder: dto.sortOrder ?? 0,
        },
      }),
    );
  }

  async update(id: string, dto: UpdatePartyCategoryDto): Promise<PartyCategoryDto> {
    const existing = await this.prisma.partyCategory.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Категория праздничного каталога не найдена');
    return serialize(
      await this.prisma.partyCategory.update({
        where: { id },
        data: {
          ...(dto.slug === undefined ? {} : { slug: dto.slug }),
          ...(dto.title === undefined ? {} : { title: dto.title.trim() }),
          ...(dto.description === undefined
            ? {}
            : { description: dto.description?.trim() || null }),
          ...(dto.isPublished === undefined ? {} : { isPublished: dto.isPublished }),
          ...(dto.sortOrder === undefined ? {} : { sortOrder: dto.sortOrder }),
        },
      }),
    );
  }

  async remove(id: string): Promise<void> {
    try {
      await this.prisma.partyCategory.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Категория праздничного каталога не найдена');
    }
  }

  async createItem(categoryId: string, dto: CreatePartyItemDto): Promise<PartyItemDto> {
    const category = await this.prisma.partyCategory.findUnique({ where: { id: categoryId } });
    if (!category) throw new NotFoundException('Категория праздничного каталога не найдена');
    validatePrice(dto.priceType, dto.amount ?? null);
    return serialize(
      await this.prisma.partyItem.create({
        data: {
          categoryId,
          title: dto.title.trim(),
          descriptionHtml:
            dto.descriptionHtml === undefined || dto.descriptionHtml === null
              ? null
              : sanitizeEditorHtml(dto.descriptionHtml),
          priceType: dto.priceType,
          amount: dto.amount ?? null,
          priceUnit: dto.priceUnit?.trim() || null,
          priceNote: dto.priceNote?.trim() || null,
          durationMinutes: dto.durationMinutes ?? null,
          ageLabel: dto.ageLabel?.trim() || null,
          isPublished: dto.isPublished ?? false,
          sortOrder: dto.sortOrder ?? 0,
        },
      }),
    );
  }

  async updateItem(id: string, dto: UpdatePartyItemDto): Promise<PartyItemDto> {
    const item = await this.prisma.partyItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Позиция праздничного каталога не найдена');
    validatePrice(
      dto.priceType ?? item.priceType,
      dto.amount === undefined ? item.amount : dto.amount,
    );
    return serialize(
      await this.prisma.partyItem.update({
        where: { id },
        data: {
          ...dto,
          ...(dto.title === undefined ? {} : { title: dto.title.trim() }),
          ...(dto.descriptionHtml === undefined
            ? {}
            : {
                descriptionHtml:
                  dto.descriptionHtml === null ? null : sanitizeEditorHtml(dto.descriptionHtml),
              }),
        },
      }),
    );
  }

  async removeItem(id: string): Promise<void> {
    try {
      await this.prisma.partyItem.delete({ where: { id } });
    } catch {
      throw new NotFoundException('Позиция праздничного каталога не найдена');
    }
  }
}

function validatePrice(priceType: CreatePartyItemDto['priceType'], amount: number | null): void {
  const requiresAmount = priceType === 'FIXED' || priceType === 'FROM';
  if (requiresAmount && amount === null) {
    throw new BadRequestException('Для фиксированной цены или цены «от» требуется сумма');
  }
  if (!requiresAmount && amount !== null) {
    throw new BadRequestException('Сумма допустима только для фиксированной цены или цены «от»');
  }
}
