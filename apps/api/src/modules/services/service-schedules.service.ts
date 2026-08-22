import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import type { ServiceScheduleDto } from '@minimishki/shared';

import { toDomainError } from '../../common/prisma-error';
import { serialize } from '../../common/serialize';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServiceScheduleDto } from './dto/create-service-schedule.dto';
import { UpdateServiceScheduleDto } from './dto/update-service-schedule.dto';
import { SERVICE_SCHEDULE_SELECT } from './services.select';
import { validateSchedule } from './services.validation';

const SCHEDULE_ERROR_MESSAGES = {
  unique: 'Расписание с такими данными уже существует',
  notFound: 'Расписание не найдено',
};

function normalizeNullableText(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  const normalized = value.trim();
  return normalized === '' ? null : normalized;
}

function toDatabaseDate(value: string | null): Date | null {
  return value === null ? null : new Date(`${value}T00:00:00.000Z`);
}

@Injectable()
export class ServiceSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(serviceId: string, dto: CreateServiceScheduleDto): Promise<ServiceScheduleDto> {
    await this.ensureServiceExists(serviceId);

    const daysOfWeek = dto.daysOfWeek ?? [];
    const startTime = dto.startTime ?? null;
    const endTime = dto.endTime ?? null;
    const validFrom = dto.validFrom ?? null;
    const validUntil = dto.validUntil ?? null;
    const label = dto.label === undefined ? null : normalizeNullableText(dto.label);

    validateSchedule({
      scheduleType: dto.scheduleType,
      daysOfWeek,
      startTime,
      endTime,
      validFrom,
      validUntil,
      label,
    });

    try {
      const schedule = await this.prisma.serviceSchedule.create({
        data: {
          serviceId,
          scheduleType: dto.scheduleType,
          daysOfWeek,
          startTime,
          endTime,
          validFrom: toDatabaseDate(validFrom),
          validUntil: toDatabaseDate(validUntil),
          label,
          isPublished: dto.isPublished,
          sortOrder: dto.sortOrder,
        },
        select: SERVICE_SCHEDULE_SELECT,
      });

      return serialize(schedule);
    } catch (error) {
      throw toDomainError(error, SCHEDULE_ERROR_MESSAGES);
    }
  }

  async update(id: string, dto: UpdateServiceScheduleDto): Promise<ServiceScheduleDto> {
    const current = await this.prisma.serviceSchedule.findUnique({
      where: { id },
      select: {
        scheduleType: true,
        daysOfWeek: true,
        startTime: true,
        endTime: true,
        validFrom: true,
        validUntil: true,
        label: true,
      },
    });

    if (!current) {
      throw new NotFoundException('Расписание не найдено');
    }

    const scheduleType = dto.scheduleType ?? current.scheduleType;
    const daysOfWeek = dto.daysOfWeek === undefined ? current.daysOfWeek : dto.daysOfWeek;
    const startTime = dto.startTime === undefined ? current.startTime : dto.startTime;
    const endTime = dto.endTime === undefined ? current.endTime : dto.endTime;
    const validFrom = dto.validFrom === undefined ? current.validFrom : dto.validFrom;
    const validUntil = dto.validUntil === undefined ? current.validUntil : dto.validUntil;
    const label = dto.label === undefined ? current.label : normalizeNullableText(dto.label);

    validateSchedule({
      scheduleType,
      daysOfWeek,
      startTime,
      endTime,
      validFrom,
      validUntil,
      label,
    });

    const data: Prisma.ServiceScheduleUpdateInput = {};

    if (dto.scheduleType !== undefined) {
      data.scheduleType = dto.scheduleType;
    }

    if (dto.daysOfWeek !== undefined) {
      data.daysOfWeek = dto.daysOfWeek;
    }

    if (dto.startTime !== undefined) {
      data.startTime = dto.startTime;
    }

    if (dto.endTime !== undefined) {
      data.endTime = dto.endTime;
    }

    if (dto.validFrom !== undefined) {
      data.validFrom = toDatabaseDate(dto.validFrom);
    }

    if (dto.validUntil !== undefined) {
      data.validUntil = toDatabaseDate(dto.validUntil);
    }

    if (dto.label !== undefined) {
      data.label = normalizeNullableText(dto.label);
    }

    if (dto.isPublished !== undefined) {
      data.isPublished = dto.isPublished;
    }

    if (dto.sortOrder !== undefined) {
      data.sortOrder = dto.sortOrder;
    }

    try {
      const schedule = await this.prisma.serviceSchedule.update({
        where: { id },
        data,
        select: SERVICE_SCHEDULE_SELECT,
      });

      return serialize(schedule);
    } catch (error) {
      throw toDomainError(error, SCHEDULE_ERROR_MESSAGES);
    }
  }

  /** Расписание удаляется физически: внешних ссылок на него нет */
  async remove(id: string): Promise<void> {
    try {
      await this.prisma.serviceSchedule.delete({
        where: { id },
        select: { id: true },
      });
    } catch (error) {
      throw toDomainError(error, SCHEDULE_ERROR_MESSAGES);
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
