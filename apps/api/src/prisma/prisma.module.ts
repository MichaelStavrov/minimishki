import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * @Global() — PrismaService внедряется в любой модуль без импорта PrismaModule.
 * Регистрируется один раз, в корневом модуле приложения.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
