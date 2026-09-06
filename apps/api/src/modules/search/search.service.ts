import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { SearchResponseDto, SearchResultDto } from '@minimishki/shared';

import { PrismaService } from '../../prisma/prisma.service';

const RESULTS_PER_TYPE = 10;

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * В первой версии ищем по коротким публичным полям. Полный HTML намеренно не
   * индексируется: он содержит разметку, а при небольшом объёме контента отдельный
   * полнотекстовый индекс PostgreSQL пока не оправдан.
   */
  async find(query: string): Promise<SearchResponseDto> {
    const now = new Date();
    const serviceWhere: Prisma.ServiceWhereInput = {
      isPublished: true,
      archivedAt: null,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { summary: { contains: query, mode: 'insensitive' } },
      ],
    };
    const postWhere: Prisma.PostWhereInput = {
      isPublished: true,
      publishedAt: { lte: now },
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { excerpt: { contains: query, mode: 'insensitive' } },
      ],
    };

    const [services, posts, servicesTotal, postsTotal] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where: serviceWhere,
        select: { slug: true, title: true, summary: true, coverUrl: true },
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        take: RESULTS_PER_TYPE,
      }),
      this.prisma.post.findMany({
        where: postWhere,
        select: { slug: true, title: true, excerpt: true, coverUrl: true },
        orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
        take: RESULTS_PER_TYPE,
      }),
      this.prisma.service.count({ where: serviceWhere }),
      this.prisma.post.count({ where: postWhere }),
    ]);

    const items: SearchResultDto[] = [
      ...services.map((service) => ({
        type: 'SERVICE' as const,
        slug: service.slug,
        title: service.title,
        excerpt: service.summary,
        coverUrl: service.coverUrl,
      })),
      ...posts.map((post) => ({
        type: 'POST' as const,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        coverUrl: post.coverUrl,
      })),
    ];

    return { query, items, total: servicesTotal + postsTotal };
  }
}
