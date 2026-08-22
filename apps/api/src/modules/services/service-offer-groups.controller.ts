import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';

import { ROLE, type ServiceOfferGroupDto } from '@minimishki/shared';

import { Roles } from '../../auth/decorators/roles.decorator';
import { CreateServiceOfferGroupDto } from './dto/create-service-offer-group.dto';
import { UpdateServiceOfferGroupDto } from './dto/update-service-offer-group.dto';
import { ServiceOfferGroupsService } from './service-offer-groups.service';

@Roles(ROLE.ADMIN)
@Controller('services')
export class ServiceOfferGroupsController {
  constructor(private readonly offerGroups: ServiceOfferGroupsService) {}

  @Post(':serviceId/offer-groups')
  create(
    @Param('serviceId') serviceId: string,
    @Body() dto: CreateServiceOfferGroupDto,
  ): Promise<ServiceOfferGroupDto> {
    return this.offerGroups.create(serviceId, dto);
  }

  @Patch('offer-groups/:groupId')
  update(
    @Param('groupId') groupId: string,
    @Body() dto: UpdateServiceOfferGroupDto,
  ): Promise<ServiceOfferGroupDto> {
    return this.offerGroups.update(groupId, dto);
  }

  @Delete('offer-groups/:groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('groupId') groupId: string): Promise<void> {
    return this.offerGroups.remove(groupId);
  }
}
