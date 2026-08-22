import { PartialType } from '@nestjs/mapped-types';

import { CreateServiceOfferGroupDto } from './create-service-offer-group.dto';

/**
 * Тело PATCH /api/services/offer-groups/:groupId.
 *
 * serviceId не редактируется: перенос группы между услугами не является обычным
 * обновлением и в API первой версии не поддерживается.
 */
export class UpdateServiceOfferGroupDto extends PartialType(CreateServiceOfferGroupDto, {
  skipNullProperties: false,
}) {}
