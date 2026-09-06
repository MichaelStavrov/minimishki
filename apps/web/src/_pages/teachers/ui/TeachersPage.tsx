import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Paginated, TeacherDto } from '@minimishki/shared';

import { getTeachers, TeacherCard } from '@/entities/teacher/index.server';

import { Button } from '@/shared/ui';

type TeachersPageProps = {
  page: number;
};

export async function TeachersPage({ page }: TeachersPageProps) {
  const catalog = await loadCatalog(page);

  if (catalog !== null && catalog.total > 0 && catalog.items.length === 0) {
    notFound();
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-teal-700 px-5 pt-14 pb-18 text-cream-50 sm:px-8 sm:pt-20 sm:pb-24">
        <div
          aria-hidden="true"
          className="absolute -top-16 right-[8%] size-64 rounded-full bg-honey-400/35 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-12 size-64 rounded-[44%] bg-coral-400/45"
        />

        <div className="relative mx-auto w-full max-w-7xl">
          <p className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
            Команда «Минимишек»
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em] sm:text-6xl">
            Взрослые, рядом с которыми хочется расти
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream-100 sm:text-xl">
            Знакомимся, поддерживаем и помогаем детям пробовать новое в своём темпе.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-7xl">
          {catalog === null ? (
            <div className="max-w-2xl rounded-3xl bg-teal-50 p-8 text-teal-700 sm:p-10">
              <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
                Обновляем знакомство
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Список педагогов временно недоступен
              </h2>
              <p className="mt-4 text-lg leading-8">
                Мы не смогли получить актуальную информацию. Позвоните нам — расскажем о команде и
                поможем выбрать занятие.
              </p>
              <Button asChild className="mt-7">
                <a href="tel:+79999288148">Позвонить в центр</a>
              </Button>
            </div>
          ) : catalog.items.length === 0 ? (
            <div className="max-w-2xl rounded-3xl bg-teal-50 p-8 text-teal-700 sm:p-10">
              <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
                Скоро познакомимся
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Рассказы о педагогах готовятся
              </h2>
              <p className="mt-4 text-lg leading-8">
                Пока оставьте заявку — мы подскажем, кто ведёт подходящее направление.
              </p>
              <Button asChild className="mt-7">
                <Link href="/#lead">Оставить заявку</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
                    Наша команда
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
                    Познакомьтесь поближе
                  </h2>
                </div>

                <p className="text-sm font-bold text-teal-700/70">
                  {catalog.total} {getTeacherWord(catalog.total)}
                </p>
              </div>

              <div className="mt-10 grid gap-5 lg:grid-cols-2">
                {catalog.items.map((teacher) => (
                  <TeacherCard key={teacher.id} teacher={teacher} />
                ))}
              </div>

              <Pagination catalog={catalog} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

async function loadCatalog(page: number): Promise<Paginated<TeacherDto> | null> {
  try {
    return await getTeachers(page);
  } catch {
    return null;
  }
}

function Pagination({ catalog }: { catalog: Paginated<TeacherDto> }) {
  const totalPages = Math.ceil(catalog.total / catalog.pageSize);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Страницы каталога педагогов"
      className="mt-12 flex flex-wrap items-center justify-center gap-3"
    >
      {catalog.page > 1 ? (
        <Button asChild variant="outline">
          <Link href={getPageHref(catalog.page - 1)}>Назад</Link>
        </Button>
      ) : null}

      <p className="px-3 text-sm font-black text-teal-700">
        Страница {catalog.page} из {totalPages}
      </p>

      {catalog.page < totalPages ? (
        <Button asChild variant="outline">
          <Link href={getPageHref(catalog.page + 1)}>Дальше</Link>
        </Button>
      ) : null}
    </nav>
  );
}

function getPageHref(page: number): string {
  return page === 1 ? '/teachers' : `/teachers?page=${page}`;
}

function getTeacherWord(count: number): string {
  const remainder = count % 100;
  const lastDigit = count % 10;

  if (remainder >= 11 && remainder <= 14) {
    return 'педагогов';
  }

  if (lastDigit === 1) {
    return 'педагог';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'педагога';
  }

  return 'педагогов';
}
