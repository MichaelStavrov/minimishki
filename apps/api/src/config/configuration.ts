import { validateEnv } from './env.validation';

/**
 * Раскладывает плоские переменные окружения по смысловым секциям.
 * Передаётся в ConfigModule.forRoot({ load: [configuration] }),
 * после чего значения читаются как config.get('jwt.secret').
 */
export const configuration = () => {
  const env = validateEnv(process.env);

  return {
    app: {
      env: env.NODE_ENV,
      port: env.PORT,
      isProduction: env.NODE_ENV === 'production',
    },
    database: {
      url: env.DATABASE_URL,
    },
    jwt: {
      secret: env.JWT_SECRET,
      expiresIn: env.JWT_EXPIRES_IN,
    },
  };
};

/** Тип конфигурации для ConfigService<AppConfig, true>. */
export type AppConfig = ReturnType<typeof configuration>;
