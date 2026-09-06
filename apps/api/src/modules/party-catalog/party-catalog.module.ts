import { Module } from '@nestjs/common';

import { PartyCatalogController } from './party-catalog.controller';
import { PartyCatalogService } from './party-catalog.service';

@Module({ controllers: [PartyCatalogController], providers: [PartyCatalogService] })
export class PartyCatalogModule {}
