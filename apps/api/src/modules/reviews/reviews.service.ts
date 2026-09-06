import { createHmac } from 'node:crypto';

import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

import {
  REVIEW_STATUS,
  type Paginated,
  type ReviewAdminDto,
  type ReviewDto,
} from '@minimishki/shared';

import { serialize } from '../../common/serialize';
import type { AppConfig } from '../../config/configuration';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ListReviewsDto } from './dto/list-reviews.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';
import { REVIEW_ADMIN_SELECT, REVIEW_PUBLIC_SELECT } from './reviews.select';

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 3;

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async findPublic({
    page,
    pageSize,
  }: {
    page: number;
    pageSize: number;
  }): Promise<Paginated<ReviewDto>> {
    const where: Prisma.ReviewWhereInput = { status: REVIEW_STATUS.PUBLISHED };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        select: REVIEW_PUBLIC_SELECT,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { items: serialize(items), total, page, pageSize };
  }

  async create(dto: CreateReviewDto, sourceIp: string): Promise<ReviewDto> {
    if (dto.website?.trim()) {
      // Не создаём запись и не раскрываем боту, какая именно проверка сработала.
      throw new HttpException(
        'Отправка временно недоступна. Попробуйте позже.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const sourceIpHash = this.hashIp(sourceIp);
    const createdAt = new Date();
    const windowStartedAt = new Date(createdAt.getTime() - RATE_LIMIT_WINDOW_MS);

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const review = await this.createWithinRateLimit(
          dto,
          sourceIpHash,
          createdAt,
          windowStartedAt,
        );
        return serialize(review);
      } catch (error) {
        // Serializable-транзакция отменяет один из конкурирующих запросов. Повторная
        // попытка увидит уже сохранённый отзыв и не превратит штатную гонку в 500.
        if (this.isSerializationConflict(error) && attempt < 2) continue;
        if (this.isSerializationConflict(error)) {
          throw new HttpException(
            'Отправка временно недоступна. Попробуйте ещё раз.',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
        throw error;
      }
    }

    throw new HttpException(
      'Отправка временно недоступна. Попробуйте ещё раз.',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  async findAllAdmin({
    page,
    pageSize,
    status,
    search,
  }: ListReviewsDto): Promise<Paginated<ReviewAdminDto>> {
    const where: Prisma.ReviewWhereInput = {
      ...(status === undefined ? {} : { status }),
      ...(search === undefined
        ? {}
        : {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { text: { contains: search, mode: 'insensitive' } },
            ],
          }),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.review.findMany({
        where,
        select: REVIEW_ADMIN_SELECT,
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.review.count({ where }),
    ]);
    return { items: serialize(items), total, page, pageSize };
  }

  async findOneAdmin(id: string): Promise<ReviewAdminDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      select: REVIEW_ADMIN_SELECT,
    });
    if (!review) throw new NotFoundException('Отзыв не найден');
    return serialize(review);
  }

  async updateStatus(id: string, dto: UpdateReviewStatusDto): Promise<ReviewAdminDto> {
    try {
      const review = await this.prisma.review.update({
        where: { id },
        data: { status: dto.status },
        select: REVIEW_ADMIN_SELECT,
      });
      return serialize(review);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Отзыв не найден');
      }
      throw error;
    }
  }

  private hashIp(ip: string): string {
    const secret = this.config.get('jwt.secret', { infer: true });
    return createHmac('sha256', secret).update(ip).digest('hex');
  }

  private async createWithinRateLimit(
    dto: CreateReviewDto,
    sourceIpHash: string,
    createdAt: Date,
    windowStartedAt: Date,
  ) {
    return this.prisma.$transaction(
      async (transaction) => {
        const count = await transaction.review.count({
          where: { sourceIpHash, createdAt: { gte: windowStartedAt } },
        });
        if (count >= RATE_LIMIT_MAX_REQUESTS) {
          throw new HttpException(
            'Слишком много отзывов. Попробуйте через час.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        return transaction.review.create({
          data: {
            name: dto.name.trim(),
            email: dto.email.trim().toLowerCase(),
            rating: dto.rating ?? null,
            text: dto.text.trim(),
            status: REVIEW_STATUS.PENDING,
            consentedAt: createdAt,
            sourceIpHash,
          },
          select: REVIEW_PUBLIC_SELECT,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  private isSerializationConflict(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034';
  }
}
