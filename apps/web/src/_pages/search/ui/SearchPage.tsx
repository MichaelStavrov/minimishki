import Link from 'next/link';
import type { SearchResponseDto, SearchResultDto } from '@minimishki/shared';

import { SearchForm } from '@/features/search';

import { Button } from '@/shared/ui';

import { search } from '../api/search';

type SearchPageProps = {
  query: string;
};

export async function SearchPage({ query }: SearchPageProps) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return <SearchPrompt query={normalizedQuery} />;
  }

  const results = await loadSearch(normalizedQuery);

  return (
    <main>
      <section className="bg-cream-100 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">Поиск</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] text-teal-700 sm:text-5xl">
            Найдём подходящее занятие или новость
          </h1>
          <SearchForm defaultValue={normalizedQuery} className="mt-8 max-w-xl" />
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-4xl">
          {results === null ? <UnavailableState /> : <SearchResults results={results} />}
        </div>
      </section>
    </main>
  );
}

function SearchPrompt({ query }: { query: string }) {
  return (
    <main className="px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-teal-50 p-8 text-teal-700 sm:p-10">
        <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">Поиск</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Введите минимум два символа</h1>
        <p className="mt-4 text-lg leading-8">
          Ищем по названиям и коротким описаниям услуг и новостей.
        </p>
        <SearchForm defaultValue={query} className="mt-7 max-w-xl" />
      </div>
    </main>
  );
}

function UnavailableState() {
  return (
    <div className="max-w-2xl rounded-3xl bg-teal-50 p-8 text-teal-700 sm:p-10">
      <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
        Попробуйте позже
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight">Поиск временно недоступен</h2>
      <p className="mt-4 text-lg leading-8">
        Не удалось получить результаты. Выберите раздел или свяжитесь с центром.
      </p>
      <Button asChild className="mt-7">
        <Link href="/contacts">Связаться с центром</Link>
      </Button>
    </div>
  );
}

function SearchResults({ results }: { results: SearchResponseDto }) {
  if (results.items.length === 0) {
    return (
      <div className="max-w-2xl rounded-3xl bg-teal-50 p-8 text-teal-700 sm:p-10">
        <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
          Ничего не нашли
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight">Попробуйте другой запрос</h2>
        <p className="mt-4 text-lg leading-8">
          По запросу «{results.query}» пока нет услуг или новостей. Можно посмотреть все
          направления.
        </p>
        <Button asChild className="mt-7">
          <Link href="/services">Все услуги</Link>
        </Button>
      </div>
    );
  }

  const hiddenResults = results.total - results.items.length;

  return (
    <>
      <p className="text-sm font-bold text-teal-700/70">
        По запросу «{results.query}» найдено: {results.total}
      </p>
      {hiddenResults > 0 ? (
        <p className="mt-2 text-sm leading-6 text-teal-700/70">
          Показаны первые {results.items.length} результатов.
        </p>
      ) : null}
      <ul className="mt-8 grid gap-4" aria-label="Результаты поиска">
        {results.items.map((item) => (
          <li key={`${item.type}-${item.slug}`}>
            <SearchResult item={item} />
          </li>
        ))}
      </ul>
    </>
  );
}

function SearchResult({ item }: { item: SearchResultDto }) {
  const href = item.type === 'SERVICE' ? `/services/${item.slug}` : `/news/${item.slug}`;
  const typeLabel = item.type === 'SERVICE' ? 'Услуга' : 'Новость';

  return (
    <Link
      href={href}
      className="block rounded-3xl bg-cream-100 p-6 text-teal-700 transition-transform hover:-translate-y-0.5 hover:shadow-soft focus-visible:ring-[3px] focus-visible:ring-teal-600/45 focus-visible:outline-none sm:p-7"
    >
      <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">{typeLabel}</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight">{item.title}</h2>
      {item.excerpt !== null ? <p className="mt-3 leading-7">{item.excerpt}</p> : null}
      <span className="mt-5 inline-block text-sm font-extrabold">Открыть →</span>
    </Link>
  );
}

async function loadSearch(query: string): Promise<SearchResponseDto | null> {
  try {
    return await search(query);
  } catch {
    return null;
  }
}
