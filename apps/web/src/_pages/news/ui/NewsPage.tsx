import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Paginated, PostDto } from '@minimishki/shared';

import { getPosts, PostCard } from '@/entities/post/index.server';

import { Button } from '@/shared/ui';

type NewsPageProps = { page: number };

export async function NewsPage({ page }: NewsPageProps) {
  const posts = await loadPosts(page);
  if (posts !== null && posts.total > 0 && posts.items.length === 0) notFound();

  return (
    <main>
      <section className="relative overflow-hidden bg-cream-100 px-5 pt-14 pb-18 sm:px-8 sm:pt-20 sm:pb-24">
        <div
          aria-hidden="true"
          className="absolute -top-14 right-[6%] size-64 rounded-full bg-honey-400/45 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 -left-12 size-72 rounded-[44%] bg-coral-100"
        />
        <div className="relative mx-auto w-full max-w-7xl">
          <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
            Что нового
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em] text-teal-700 sm:text-6xl">
            События, которыми хочется поделиться
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-teal-700 sm:text-xl">
            Рассказываем о занятиях, встречах, праздниках и маленьких открытиях «Минимишек».
          </p>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-7xl">
          {posts === null ? (
            <UnavailableState />
          ) : posts.items.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
                    Лента центра
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
                    Бережно сохраняем важное
                  </h2>
                </div>
                <p className="text-sm font-bold text-teal-700/70">
                  {posts.total} {getPostWord(posts.total)}
                </p>
              </div>
              <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {posts.items.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination posts={posts} />
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function UnavailableState() {
  return (
    <div className="max-w-2xl rounded-3xl bg-teal-50 p-8 text-teal-700 sm:p-10">
      <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
        Обновляем ленту
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight">Новости временно недоступны</h2>
      <p className="mt-4 text-lg leading-8">
        Мы не смогли получить свежие публикации. Позвоните нам — расскажем о ближайших событиях.
      </p>
      <Button asChild className="mt-7">
        <a href="tel:+79999288148">Позвонить в центр</a>
      </Button>
    </div>
  );
}
function EmptyState() {
  return (
    <div className="max-w-2xl rounded-3xl bg-teal-50 p-8 text-teal-700 sm:p-10">
      <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
        Скоро будет интересно
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight">Готовим первые новости</h2>
      <p className="mt-4 text-lg leading-8">
        Следите за нами в социальных сетях или позвоните в центр, чтобы не пропустить ближайшую
        встречу.
      </p>
      <Button asChild className="mt-7">
        <Link href="/contacts">Связаться с центром</Link>
      </Button>
    </div>
  );
}
function Pagination({ posts }: { posts: Paginated<PostDto> }) {
  const pages = Math.ceil(posts.total / posts.pageSize);
  if (pages <= 1) return null;
  return (
    <nav
      aria-label="Страницы новостей"
      className="mt-12 flex flex-wrap items-center justify-center gap-3"
    >
      {posts.page > 1 ? (
        <Button asChild variant="outline">
          <Link href={href(posts.page - 1)}>Назад</Link>
        </Button>
      ) : null}
      <p className="px-3 text-sm font-black text-teal-700">
        Страница {posts.page} из {pages}
      </p>
      {posts.page < pages ? (
        <Button asChild variant="outline">
          <Link href={href(posts.page + 1)}>Дальше</Link>
        </Button>
      ) : null}
    </nav>
  );
}
async function loadPosts(page: number): Promise<Paginated<PostDto> | null> {
  try {
    return await getPosts(page);
  } catch {
    return null;
  }
}
function href(page: number) {
  return page === 1 ? '/news' : `/news?page=${page}`;
}
function getPostWord(count: number) {
  const remainder = count % 100;
  const digit = count % 10;
  if (remainder >= 11 && remainder <= 14) return 'публикаций';
  if (digit === 1) return 'публикация';
  if (digit >= 2 && digit <= 4) return 'публикации';
  return 'публикаций';
}
