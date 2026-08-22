import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';

import { ROLE, type ServiceOfferDto } from '@minimishki/shared';

import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateServiceOfferDto } from './dto/create-service-offer.dto';
import { UpdateServiceOfferDto } from './dto/update-service-offer.dto';
import { ServiceOffersService } from './service-offers.service';

@Roles(ROLE.ADMIN)
@Controller('services')
export class ServiceOffersController {
  constructor(private readonly offers: ServiceOffersService) {}

  @Post('offer-groups/:groupId/offers')
  create(
    @Param('groupId') groupId: string,
    @Body() dto: CreateServiceOfferDto,
  ): Promise<ServiceOfferDto> {
    return this.offers.create(groupId, dto);
  }

  @Patch('offers/:offerId')
  update(
    @Param('offerId') offerId: string,
    @Body() dto: UpdateServiceOfferDto,
  ): Promise<ServiceOfferDto> {
    return this.offers.update(offerId, dto);
  }

  @Delete('offers/:offerId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('offerId') offerId: string): Promise<void> {
    return this.offers.remove(offerId);
  }
}
