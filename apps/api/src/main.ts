import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import type { Response } from 'express';
import { mkdirSync } from 'node:fs';

import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';
import { UPLOADS_DIRECTORY } from './modules/uploads/uploads.constants';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);

  // Все маршруты живут под /api: GET /health превращается в GET /api/health.
  app.setGlobalPrefix('api');

  // Имена файлов генерируются сервером, поэтому их можно долго кэшировать без риска устаревшей версии.
  mkdirSync(UPLOADS_DIRECTORY, { recursive: true });
  app.useStaticAssets(UPLOADS_DIRECTORY, {
    prefix: '/uploads/',
    setHeaders: (response: Response) => {
      response.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      response.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // отрезает поля, которых нет в DTO
      transform: true, // приводит типы к объявленным в DTO
    }),
  );

  // Браузер разрешит кросс-доменный запрос только с настроенного frontend-origin.
  const corsOrigin = config.get('cors.origin', { infer: true });
  app.enableCors({ origin: [corsOrigin] });

  // Без этого onModuleDestroy не вызовется при Ctrl+C и SIGTERM.
  app.enableShutdownHooks();

  const port = config.get('app.port', { infer: true });
  await app.listen(port);

  Logger.log(`API слушает http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
