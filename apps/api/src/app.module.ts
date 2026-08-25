import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './auth/auth.module';
import { configuration } from './config/configuration';
import { validateEnv } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { GalleryItemsModule } from './modules/gallery-items/gallery-items.module';
import { LeadsModule } from './modules/leads/leads.module';
import { PostsModule } from './modules/posts/posts.module';
import { ServicesModule } from './modules/services/services.module';
import { TeachersModule } from './modules/teachers/teachers.module';
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
    LeadsModule,
    PostsModule,
    GalleryItemsModule,
  ],
})
export class AppModule {}
