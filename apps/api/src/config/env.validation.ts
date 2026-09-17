import { z } from 'zod';

/** Поддерживаемые проектом единицы срока жизни JWT. */
type JwtExpiresIn = `${number}${'s' | 'm' | 'h' | 'd'}`;

/** Пустая строка из .env означает, что необязательная интеграция не настроена. */
const optionalEnvString = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().trim().min(1).optional(),
);

/**
 * Проверяет, что значение является чистым origin:
 * протокол + хост + необязательный порт, без остальных частей URL.
 */
function isHttpOrigin(value: string): boolean {
  try {
    const url = new URL(value);

    return /^https?:\/\/[^/?#\\]+$/i.test(value) && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}

/**
 * Схема переменных окружения apps/api.
 * Каждое поле здесь обязано иметь пару в apps/api/.env.example.
 */
const envSchema = z
  .object({
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

    /**
     * z.custom одновременно проверяет значение в рантайме и сообщает TypeScript
     * точный шаблон строки. Обычный .regex() сохранил бы слишком широкий тип string,
     * который нельзя безопасно передать в @nestjs/jwt.
     */
    JWT_EXPIRES_IN: z
      .custom<JwtExpiresIn>(
        (value) => typeof value === 'string' && /^[1-9]\d*[smhd]$/.test(value),
        'JWT_EXPIRES_IN: положительное число и единица времени — 60s, 15m, 12h, 30d',
      )
      .default('30d'),

    // Origin разрешённого frontend-приложения для CORS.
    WEB_ORIGIN: z
      .url({
        protocol: /^https?$/,
        error: 'WEB_ORIGIN: ожидается HTTP(S)-адрес, например http://localhost:3000',
      })
      .refine(
        isHttpOrigin,
        'WEB_ORIGIN: укажите только origin без пути, завершающего слеша, query, hash и данных доступа',
      ),

    // Порт HTTP-сервера. Из process.env приходит строкой, coerce приводит к числу.
    PORT: z.coerce
      .number({ error: 'PORT: целое число от 1 до 65535' })
      .int({ error: 'PORT: целое число от 1 до 65535' })
      .min(1, 'PORT: целое число от 1 до 65535')
      .max(65535, 'PORT: целое число от 1 до 65535')
      .default(3001),

    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

    // Каналы уведомлений обязательны в production, но могут быть отключены локально.
    MAX_BOT_TOKEN: optionalEnvString,
    // chat_id появляется только после доставки подписанного события bot_added.
    MAX_CHAT_ID: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().regex(/^\d+$/, 'MAX_CHAT_ID: положительное целое число').optional(),
    ),
    MAX_WEBHOOK_SECRET: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z
        .string()
        .regex(
          /^[A-Za-z0-9_-]{5,256}$/,
          'MAX_WEBHOOK_SECRET: от 5 до 256 символов A-Z, a-z, 0-9, _ или -',
        )
        .optional(),
    ),
    SMTP_HOST: optionalEnvString,
    SMTP_PORT: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.coerce.number().int().min(1).max(65535).optional(),
    ),
    SMTP_USER: optionalEnvString,
    SMTP_PASSWORD: optionalEnvString,
    SMTP_FROM: optionalEnvString,
    NOTIFICATION_EMAIL: optionalEnvString,
  })
  .superRefine((env, context) => {
    const maxConfigured = Boolean(env.MAX_BOT_TOKEN || env.MAX_CHAT_ID || env.MAX_WEBHOOK_SECRET);
    const smtpFields = [
      env.SMTP_HOST,
      env.SMTP_PORT,
      env.SMTP_USER,
      env.SMTP_PASSWORD,
      env.SMTP_FROM,
      env.NOTIFICATION_EMAIL,
    ];
    const smtpConfigured = smtpFields.some(Boolean);

    if (maxConfigured && (!env.MAX_BOT_TOKEN || !env.MAX_WEBHOOK_SECRET)) {
      context.addIssue({
        code: 'custom',
        message: 'MAX_BOT_TOKEN и MAX_WEBHOOK_SECRET должны быть заданы вместе',
      });
    }

    if (smtpConfigured && smtpFields.some((value) => !value)) {
      context.addIssue({
        code: 'custom',
        message:
          'SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM и NOTIFICATION_EMAIL должны быть заданы вместе',
      });
    }

    if (env.NODE_ENV === 'production' && (!maxConfigured || !smtpConfigured)) {
      context.addIssue({
        code: 'custom',
        message: 'в production должны быть настроены MAX и SMTP-уведомления',
      });
    }
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
