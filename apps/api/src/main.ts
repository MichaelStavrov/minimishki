import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);

  // Все маршруты живут под /api: GET /health превращается в GET /api/health.
  app.setGlobalPrefix('api');

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
