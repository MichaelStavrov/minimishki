import { z } from 'zod';

/**
 * Схема переменных окружения apps/api.
 * Каждое поле здесь обязано иметь пару в apps/api/.env.example.
 */
const envSchema = z.object({
  // Строка подключения к PostgreSQL — её читает Prisma.
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error:
      'DATABASE_URL: ожидается строка вида postgresql://user:password@host:5432/db?schema=public',
  }),

  // Секрет для подписи JWT. Команда генерации — в комментарии .env.example.
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET: не короче 32 символов, см. комментарий в .env.example'),

  // Срок жизни токена в формате, который понимает @nestjs/jwt: 60s, 15m, 12h, 30d.
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, 'JWT_EXPIRES_IN: число и единица времени — 60s, 15m, 12h, 30d')
    .default('30d'),

  // Порт HTTP-сервера. Из process.env приходит строкой, coerce приводит к числу.
  PORT: z.coerce
    .number({ error: 'PORT: целое число от 1 до 65535' })
    .int({ error: 'PORT: целое число от 1 до 65535' })
    .min(1, 'PORT: целое число от 1 до 65535')
    .max(65535, 'PORT: целое число от 1 до 65535')
    .default(3001),

  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/** Плоский набор переменных окружения после валидации и приведения типов. */
export type Env = z.infer<typeof envSchema>;

/**
 * Проверяет переменные окружения на старте приложения.
 * Передаётся в ConfigModule.forRoot({ validate }).
 * Бросает исключение — приложение не поднимется с неполным окружением.
 */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    throw new Error(
      `Некорректные переменные окружения (apps/api/.env):\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
