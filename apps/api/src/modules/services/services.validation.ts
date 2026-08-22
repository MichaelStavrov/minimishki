import { BadRequestException } from '@nestjs/common';

import {
  AGE_MODE,
  PRICE_TYPE,
  SCHEDULE_TYPE,
  type AgeMode,
  type DayOfWeek,
  type PriceType,
  type ScheduleType,
} from '@minimishki/shared';

type AgeRange = {
  ageFromMonths: number | null;
  ageToMonths: number | null;
};

type OfferValidationInput = AgeRange & {
  priceType: PriceType;
  amount: number | null;
  ageMode: AgeMode;
};

type ScheduleValidationInput = {
  scheduleType: ScheduleType;
  daysOfWeek: readonly DayOfWeek[];
  startTime: string | null;
  endTime: string | null;
  validFrom: string | Date | null;
  validUntil: string | Date | null;
  label: string | null;
};

/** Проверяет общий возрастной диапазон услуги или предложения */
export function validateAgeRange({ ageFromMonths, ageToMonths }: AgeRange): void {
  if (ageFromMonths !== null && ageToMonths !== null && ageFromMonths > ageToMonths) {
    throw new BadRequestException('Минимальный возраст не может превышать максимальный');
  }
}

/** Проверяет зависимые правила цены и возрастного режима предложения */
export function validateOffer({
  priceType,
  amount,
  ageMode,
  ageFromMonths,
  ageToMonths,
}: OfferValidationInput): void {
  const requiresAmount = priceType === PRICE_TYPE.FIXED || priceType === PRICE_TYPE.FROM;

  if (requiresAmount && amount === null) {
    throw new BadRequestException('Для типов цены FIXED и FROM необходимо указать amount');
  }

  if (!requiresAmount && amount !== null) {
    throw new BadRequestException(
      'Для типов цены FREE, INCLUDED и ON_REQUEST поле amount должно быть null',
    );
  }

  if (ageMode === AGE_MODE.CUSTOM && ageFromMonths === null && ageToMonths === null) {
    throw new BadRequestException(
      'Для режима возраста CUSTOM нужна хотя бы одна возрастная граница',
    );
  }

  if (ageMode !== AGE_MODE.CUSTOM && (ageFromMonths !== null || ageToMonths !== null)) {
    throw new BadRequestException(
      'Собственные возрастные границы разрешены только для режима CUSTOM',
    );
  }

  validateAgeRange({ ageFromMonths, ageToMonths });
}

/** Проверяет комбинацию полей расписания после объединения данных PATCH */
export function validateSchedule({
  scheduleType,
  daysOfWeek,
  startTime,
  endTime,
  validFrom,
  validUntil,
  label,
}: ScheduleValidationInput): void {
  if (new Set(daysOfWeek).size !== daysOfWeek.length) {
    throw new BadRequestException('Расписание не должно содержать повторяющиеся дни недели');
  }

  if (scheduleType === SCHEDULE_TYPE.RECURRING) {
    if (daysOfWeek.length === 0) {
      throw new BadRequestException('Для регулярного расписания нужен хотя бы один день недели');
    }

    if (startTime === null || endTime === null) {
      throw new BadRequestException('Для регулярного расписания обязательны startTime и endTime');
    }

    if (startTime >= endTime) {
      throw new BadRequestException('Время начала расписания должно быть раньше времени окончания');
    }
  }

  if (scheduleType === SCHEDULE_TYPE.ON_REQUEST) {
    if (daysOfWeek.length > 0 || startTime !== null || endTime !== null) {
      throw new BadRequestException(
        'Для расписания ON_REQUEST дни недели и время должны отсутствовать',
      );
    }

    if (label === null || label.trim() === '') {
      throw new BadRequestException('Для расписания ON_REQUEST обязательна публичная подпись');
    }
  }

  if (
    validFrom !== null &&
    validUntil !== null &&
    toTimestamp(validFrom) > toTimestamp(validUntil)
  ) {
    throw new BadRequestException('Дата начала действия не может быть позже даты окончания');
  }
}

function toTimestamp(value: string | Date): number {
  return value instanceof Date ? value.getTime() : Date.parse(`${value}T00:00:00.000Z`);
}
