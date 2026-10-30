import 'dotenv/config';

import { Prisma, PrismaClient } from '@prisma/client';

import { holidayCategories } from './holiday-content';

const apply = process.argv.includes('--apply');
const inspect = process.argv.includes('--inspect');
const prisma = new PrismaClient();

function print(message: string): void {
  process.stdout.write(`${message}\n`);
}

function assertLocalDatabase(): void {
  const connection = new URL(process.env.DATABASE_URL ?? '');
  if (
    process.env.NODE_ENV === 'production' ||
    !['localhost', '127.0.0.1', '[::1]'].includes(connection.hostname)
  ) {
    throw new Error('Импорт разрешён только в локальную базу development/test.');
  }
}

function validateContent(): void {
  const slugs = new Set<string>();
  for (const category of holidayCategories) {
    if (slugs.has(category.slug)) throw new Error(`Повтор категории: ${category.slug}`);
    slugs.add(category.slug);
    const titles = new Set<string>();
    for (const item of category.items) {
      if (titles.has(item.title)) throw new Error(`Повтор позиции: ${item.title}`);
      titles.add(item.title);
      if (
        (['FIXED', 'FROM'].includes(item.priceType) &&
          (item.amount === null || !Number.isSafeInteger(item.amount) || item.amount <= 0)) ||
        (!['FIXED', 'FROM'].includes(item.priceType) && item.amount !== null)
      ) {
        throw new Error(`Некорректная цена: ${item.title}`);
      }
    }
  }
}

async function main(): Promise<void> {
  validateContent();
  const count = holidayCategories.reduce((total, category) => total + category.items.length, 0);
  print(`Подготовлено категорий: ${holidayCategories.length}; позиций: ${count}.`);

  if (!apply && !inspect) {
    print('Проверка контента завершена без подключения к БД. Для импорта: --apply.');
    return;
  }

  assertLocalDatabase();
  if (inspect) {
    print(
      JSON.stringify(
        {
          categories: await prisma.partyCategory.findMany({
            select: { slug: true, title: true, items: { select: { title: true } } },
          }),
          services: await prisma.service.findMany({ select: { slug: true, title: true } }),
        },
        null,
        2,
      ),
    );
    return;
  }

  await prisma.$transaction(
    async (tx) => {
      // Один импорт за раз; повторный запуск обновляет свои позиции без удаления остальных.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(306102026)`;
      for (const [categoryIndex, category] of holidayCategories.entries()) {
        const { items, ...fields } = category;
        const candidates = await tx.partyCategory.findMany({
          where: { OR: [{ slug: category.slug }, { title: category.title }] },
        });
        if (candidates.length > 1) {
          throw new Error(`Найдены разные категории с совпадающими именем/slug: ${category.title}`);
        }
        const existing = candidates[0];
        const saved = existing
          ? await tx.partyCategory.update({
              where: { id: existing.id },
              data: { title: fields.title, description: fields.description },
            })
          : await tx.partyCategory.create({
              data: { ...fields, isPublished: true, sortOrder: (categoryIndex + 1) * 10 },
            });

        for (const [itemIndex, item] of items.entries()) {
          const matches = await tx.partyItem.findMany({
            where: { categoryId: saved.id, title: item.title },
            select: { id: true },
          });
          if (matches.length > 1) throw new Error(`В базе есть дубли: ${item.title}`);
          const match = matches[0];
          if (match) {
            await tx.partyItem.update({ where: { id: match.id }, data: item });
          } else {
            await tx.partyItem.create({
              data: {
                ...item,
                categoryId: saved.id,
                isPublished: true,
                sortOrder: (itemIndex + 1) * 10,
              },
            });
          }
        }
      }
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, timeout: 30000 },
  );
  print(`Импорт завершён: ${count} позиций. Остальные материалы и статусы публикации сохранены.`);
}

void main()
  .catch((error: unknown) => {
    // Ошибки подключения могут содержать реквизиты БД, поэтому не печатаем их целиком.
    console.error(
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Ошибка Prisma: ${error.code}. Все изменения импорта отменены.`
        : error instanceof Prisma.PrismaClientInitializationError
          ? 'Не удалось подключиться к локальной БД. Проверьте PostgreSQL и DATABASE_URL.'
          : error instanceof Error
            ? error.message
            : 'Неизвестная ошибка импорта.',
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
