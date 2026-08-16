import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * PrismaModule не импортируется: он объявлен @Global() на шаге 14.
 * exports обязателен — на шаге 17 AuthModule дотянется до findByEmailWithHash,
 * а без экспорта провайдер виден только внутри своего модуля.
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
