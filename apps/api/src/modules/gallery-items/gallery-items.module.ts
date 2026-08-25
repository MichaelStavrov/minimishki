import { Module } from '@nestjs/common';

import { GalleryItemsController } from './gallery-items.controller';
import { GalleryItemsService } from './gallery-items.service';

@Module({
  controllers: [GalleryItemsController],
  providers: [GalleryItemsService],
})
export class GalleryItemsModule {}
