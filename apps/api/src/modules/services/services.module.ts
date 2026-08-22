import { Module } from '@nestjs/common';

import { ServiceOfferGroupsController } from './service-offer-groups.controller';
import { ServiceOfferGroupsService } from './service-offer-groups.service';
import { ServiceOffersController } from './service-offers.controller';
import { ServiceOffersService } from './service-offers.service';
import { ServiceSchedulesController } from './service-schedules.controller';
import { ServiceSchedulesService } from './service-schedules.service';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';

@Module({
  controllers: [
    ServicesController,
    ServiceOfferGroupsController,
    ServiceOffersController,
    ServiceSchedulesController,
  ],
  providers: [
    ServicesService,
    ServiceOfferGroupsService,
    ServiceOffersService,
    ServiceSchedulesService,
  ],
})
export class ServicesModule {}
