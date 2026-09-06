import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PostDto } from '@minimishki/shared';

import { getPostBySlug } from '@/entities/post/index.server';

import { ApiError } from '@/shared/api/index.server';
import { Button } from '@/shared/ui';

type PostDetailPageProps = { slug: string };

export async function PostDetailPage({ slug }: PostDetailPageProps) {
  const post = await loadPost(slug);
  const gallery = post.gallery ?? [];
  return (
    <main>
      <section className="relative overflow-hidden bg-teal-700 px-5 pt-12 pb-18 text-cream-50 sm:px-8 sm:pt-18 sm:pb-24">
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-12 size-72 rounded-full bg-honey-400"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 -left-16 size-80 rounded-[44%] bg-coral-400"
        />
        <div className="relative mx-auto w-full max-w-7xl">
          <Link
            href="/news"
            className="inline-flex text-sm font-extrabold text-honey-400 underline decoration-honey-400/50 underline-offset-4 hover:text-cream-50 focus-visible:ring-[3px] focus-visible:ring-honey-400/60 focus-visible:outline-none"
          >
            ← Все новости
          </Link>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
            <div>
              <p className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
                {formatDate(post.publishedAt)}
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                {post.title}
              </h1>
              {post.excerpt !== null ? (
                <p className="mt-6 max-w-2xl text-lg leading-8 text-cream-100 sm:text-xl">
                  {post.excerpt}
                </p>
              ) : null}
            </div>
            <HeroMedia post={post} />
          </div>
        </div>
      </section>
      {hasDetails(post) ? (
        <section className="border-b border-cream-200 bg-cream-100 px-5 py-8 sm:px-8">
          <div className="mx-auto grid w-full max-w-7xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <EventDetails post={post} />
          </div>
        </section>
      ) : null}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <article
          className="mx-auto max-w-3xl space-y-4 text-lg leading-8 text-teal-700 [&_a]:font-extrabold [&_a]:text-coral-400 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-black [&_h2]:tracking-tight [&_h3]:mt-7 [&_h3]:text-2xl [&_h3]:font-black [&_p]:max-w-3xl [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </section>
      {gallery.length > 0 ? (
        <section className="bg-teal-50 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              Фотографии события
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
              Тёплые моменты вместе
            </h2>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item) => (
                <figure
                  key={item.id}
                  className="overflow-hidden rounded-3xl bg-teal-700 shadow-soft"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.url}
                      alt={item.alt ?? item.caption ?? `Фотография к новости «${post.title}»`}
                      fill
                      sizes="(min-width: 1024px) 370px, 50vw"
                      className="object-cover"
                    />
                  </div>
                  {item.caption !== null ? (
                    <figcaption className="px-5 py-4 text-sm font-bold text-cream-50">
                      {item.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[2rem] bg-honey-100 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              Хотите к нам?
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-teal-700">
              Подскажем, что будет интересно ребёнку
            </h2>
          </div>
          <Button asChild size="lg">
            <Link href="/#lead">Оставить заявку</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

function HeroMedia({ post }: { post: PostDto }) {
  const coverUrl = post.coverUrl;

  if (coverUrl === null) {
    return (
      <div className="relative flex aspect-[4/3] items-end overflow-hidden rounded-[2rem] border border-cream-50/20 bg-teal-600/80 p-7 shadow-lifted">
        <div
          aria-hidden="true"
          className="absolute -top-14 -right-9 size-44 rounded-full bg-honey-400"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-16 -left-8 size-40 rounded-[44%] bg-coral-400"
        />
        <p className="relative max-w-55 text-2xl leading-8 font-black">
          Важные новости «Минимишек»
        </p>
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-teal-600 shadow-lifted">
      <Image
        src={coverUrl}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 42vw, 100vw"
        className="object-cover"
      />
    </div>
  );
}
function EventDetails({ post }: { post: PostDto }) {
  const details = [
    { label: 'Когда', value: eventDate(post.eventStartsAt, post.eventEndsAt) },
    { label: 'Возраст', value: post.ageLabel },
    { label: 'Стоимость', value: post.priceLabel },
    {
      label: 'Запись',
      value: post.registrationLabel ?? (post.registrationUrl !== null ? 'Открыть запись' : null),
      href: post.registrationUrl,
    },
  ].filter(
    (detail): detail is { label: string; value: string; href?: string | null } =>
      detail.value !== null,
  );

  return details.map((detail) => (
    <div key={detail.label}>
      <p className="text-sm font-bold text-teal-700/70">{detail.label}</p>
      {detail.href !== null && detail.href !== undefined ? (
        <a
          href={detail.href}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex text-lg font-black text-teal-700 underline decoration-coral-400 decoration-2 underline-offset-4 outline-none focus-visible:ring-[3px] focus-visible:ring-teal-600/45"
        >
          {detail.value}
        </a>
      ) : (
        <p className="mt-1 text-lg font-black text-teal-700">{detail.value}</p>
      )}
    </div>
  ));
}
function hasDetails(post: PostDto) {
  return (
    post.eventStartsAt !== null ||
    post.ageLabel !== null ||
    post.priceLabel !== null ||
    post.registrationLabel !== null ||
    post.registrationUrl !== null
  );
}
async function loadPost(slug: string): Promise<PostDto> {
  try {
    return await getPostBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) notFound();
    throw error;
  }
}
function formatDate(value: string | null) {
  if (value === null) return 'Новости центра';
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Moscow',
  }).format(new Date(value));
}
function eventDate(startValue: string | null, endValue: string | null): string | null {
  if (startValue === null) return null;
  const date = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Moscow',
  });
  const time = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  });
  const start = new Date(startValue);
  return `${date.format(start)}, ${time.format(start)}${endValue === null ? '' : `–${time.format(new Date(endValue))}`}`;
}
