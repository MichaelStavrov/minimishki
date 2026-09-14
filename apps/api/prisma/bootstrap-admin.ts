import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { z } from 'zod';

const prisma = new PrismaClient();

/**
 * PostgreSQL advisory lock не позволяет двум одновременным запускам создать
 * нескольких первых администраторов до проверки роли ADMIN.
 */
const BOOTSTRAP_ADMIN_LOCK_ID = 9_189_240;

const bootstrapEnvironmentSchema = z
  .object({
    NODE_ENV: z.literal('production', {
      error: 'BOOTSTRAP_ADMIN доступен только при NODE_ENV=production',
    }),
    BOOTSTRAP_ADMIN_EMAIL: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email('BOOTSTRAP_ADMIN_EMAIL: ожидается корректный email')),
    BOOTSTRAP_ADMIN_PASSWORD: z
      .string()
      .min(8, 'BOOTSTRAP_ADMIN_PASSWORD: пароль короче 8 символов')
      .max(128, 'BOOTSTRAP_ADMIN_PASSWORD: пароль длиннее 128 символов'),
  })
  .transform((env) => ({
    email: env.BOOTSTRAP_ADMIN_EMAIL,
    password: env.BOOTSTRAP_ADMIN_PASSWORD,
  }));

function getCredentials(): { email: string; password: string } {
  const result = bootstrapEnvironmentSchema.safeParse(process.env);

  if (!result.success) {
    throw new Error(
      `Некорректные переменные окружения для bootstrap администратора:\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}

async function bootstrapAdmin(): Promise<void> {
  const credentials = getCredentials();
  const passwordHash = await argon2.hash(credentials.password);

  await prisma.$transaction(async (transaction) => {
    await transaction.$executeRaw`SELECT pg_advisory_xact_lock(${BOOTSTRAP_ADMIN_LOCK_ID})`;

    const existingAdmin = await transaction.user.findFirst({
      where: { role: Role.ADMIN },
      select: { id: true },
    });

    if (existingAdmin) {
      throw new Error(
        'Администратор уже существует. Bootstrap разрешено выполнить только один раз.',
      );
    }

    await transaction.user.create({
      data: {
        email: credentials.email,
        passwordHash,
        name: 'Главный администратор',
        role: Role.ADMIN,
      },
    });
  });

  console.log(`Главный администратор создан: ${credentials.email}`);
}

void bootstrapAdmin()
  .catch((error: unknown) => {
    console.error('Bootstrap администратора завершился с ошибкой');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
