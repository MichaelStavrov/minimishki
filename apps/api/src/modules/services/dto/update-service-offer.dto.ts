import { PartialType } from '@nestjs/mapped-types';

import { CreateServiceOfferDto } from './create-service-offer.dto';

/**
 * Тело PATCH /api/services/offers/:offerId.
 *
 * groupId не редактируется: перенос предложения между группами не входит
 * в обычное обновление сущности.
 */
export class UpdateServiceOfferDto extends PartialType(CreateServiceOfferDto, {
  skipNullProperties: false,
}) {}
