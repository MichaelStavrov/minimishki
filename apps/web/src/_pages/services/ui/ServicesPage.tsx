import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Paginated, ServiceDto } from '@minimishki/shared';

import { getServices, ServiceCard } from '@/entities/service/index.server';

import { Button } from '@/shared/ui';

type ServicesPageProps = {
  page: number;
};

export async function ServicesPage({ page }: ServicesPageProps) {
  const catalog = await loadCatalog(page);

  if (catalog !== null && catalog.total > 0 && catalog.items.length === 0) {
    notFound();
  }

  return (
    <main>
      <section className="relative overflow-hidden bg-cream-100 px-5 pt-14 pb-18 sm:px-8 sm:pt-20 sm:pb-24">
        <div
          aria-hidden="true"
          className="absolute top-4 right-[8%] size-52 rounded-[44%] bg-honey-400/45 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-12 size-64 rounded-full bg-coral-100"
        />

        <div className="relative mx-auto w-full max-w-7xl">
          <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
            Карта маленьких приключений
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em] text-teal-700 sm:text-6xl">
            Найдите занятие, которое хочется ждать всю неделю
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-teal-700 sm:text-xl">
            У каждого ребёнка свой интерес и темп. Выберите направление, а мы расскажем о программе,
            расписании и первом посещении.
          </p>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-7xl">
          {catalog === null ? (
            <div className="max-w-2xl rounded-3xl bg-teal-50 p-8 text-teal-700 sm:p-10">
              <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
                Обновляем расписание
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Направления временно недоступны
              </h2>
              <p className="mt-4 text-lg leading-8">
                Мы не смогли получить актуальный список занятий. Позвоните нам — поможем выбрать
                подходящий формат.
              </p>
              <Button asChild className="mt-7">
                <a href="tel:+79999288148">Позвонить в центр</a>
              </Button>
            </div>
          ) : catalog.items.length === 0 ? (
            <div className="max-w-2xl rounded-3xl bg-teal-50 p-8 text-teal-700 sm:p-10">
              <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
                Скоро здесь появится новое
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">
                Направления готовятся к встрече
              </h2>
              <p className="mt-4 text-lg leading-8">
                Пока подскажем подходящее занятие по телефону или через форму на главной странице.
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
                    Все направления
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
                    Выбирайте сердцем
                  </h2>
                </div>

                <p className="text-sm font-bold text-teal-700/70">
                  {catalog.total} {getServiceWord(catalog.total)}
                </p>
              </div>

              <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.items.map((service) => (
                  <ServiceCard key={service.id} service={service} />
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

async function loadCatalog(page: number): Promise<Paginated<ServiceDto> | null> {
  try {
    return await getServices(page);
  } catch {
    return null;
  }
}

function Pagination({ catalog }: { catalog: Paginated<ServiceDto> }) {
  const totalPages = Math.ceil(catalog.total / catalog.pageSize);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Страницы каталога услуг"
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
  return page === 1 ? '/services' : `/services?page=${page}`;
}

function getServiceWord(count: number): string {
  const remainder = count % 100;
  const lastDigit = count % 10;

  if (remainder >= 11 && remainder <= 14) {
    return 'направлений';
  }

  if (lastDigit === 1) {
    return 'направление';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'направления';
  }

  return 'направлений';
}
