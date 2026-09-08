import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { configuration } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { GalleryItemsModule } from './modules/gallery-items/gallery-items.module';
import { PartyCatalogModule } from './modules/party-catalog/party-catalog.module';
import { LeadsModule } from './modules/leads/leads.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PostsModule } from './modules/posts/posts.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SearchModule } from './modules/search/search.module';
import { ServicesModule } from './modules/services/services.module';
import { SiteSettingsModule } from './modules/site-settings/site-settings.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    PrismaModule,
    HealthModule,
    UsersModule,
    AuthModule,
    ServicesModule,
    TeachersModule,
    UploadsModule,
    NotificationsModule,
    LeadsModule,
    PostsModule,
    ReviewsModule,
    SearchModule,
    SiteSettingsModule,
    GalleryItemsModule,
    PartyCatalogModule,
  ],
})
export class AppModule {}
