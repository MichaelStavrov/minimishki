import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { GalleryItemDto, Paginated } from '@minimishki/shared';

import { contacts } from '@/shared/config/contacts';
import { Button } from '@/shared/ui';

import { getGalleryItems } from '../api/get-gallery-items';

import { GalleryLightbox } from './GalleryLightbox';

type GalleryPageProps = { page: number };

export async function GalleryPage({ page }: GalleryPageProps) {
  const gallery = await loadGallery(page);

  if (gallery !== null && gallery.total > 0 && gallery.items.length === 0) notFound();

  return (
    <main>
      <section className="relative overflow-hidden bg-teal-700 px-5 pt-14 pb-18 text-cream-50 sm:px-8 sm:pt-20 sm:pb-24">
        <div
          aria-hidden="true"
          className="absolute -top-20 right-[8%] size-72 rounded-[44%] bg-honey-400/80 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 -left-16 size-80 rounded-full bg-coral-400/70"
        />
        <div className="relative mx-auto w-full max-w-7xl">
          <p className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
            Наши моменты
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em] sm:text-6xl">
            Здесь шумно, тепло и очень по-настоящему
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream-100 sm:text-xl">
            Собрали кадры из жизни «Минимишек»: игры, занятия, творчество и праздники, которые
            хочется запомнить.
          </p>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-7xl">
          {gallery === null ? (
            <UnavailableState />
          ) : gallery.items.length === 0 ? (
            <EmptyState />
          ) : (
            <GalleryContent gallery={gallery} />
          )}
        </div>
      </section>
    </main>
  );
}

function GalleryContent({ gallery }: { gallery: Paginated<GalleryItemDto> }) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
            Фотоальбом центра
          </p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
            Листайте, чтобы почувствовать атмосферу
          </h2>
        </div>
        <p className="text-sm font-bold text-teal-700/70">
          {gallery.total} {getPhotoWord(gallery.total)}
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.items.map((item, index) => (
          <GalleryLightbox
            key={item.id}
            item={item}
            index={(gallery.page - 1) * gallery.pageSize + index}
          />
        ))}
      </div>
      <Pagination gallery={gallery} />
    </>
  );
}

function UnavailableState() {
  return (
    <div className="max-w-2xl rounded-3xl bg-teal-50 p-8 text-teal-700 sm:p-10">
      <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
        Обновляем альбом
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight">Галерея временно недоступна</h2>
      <p className="mt-4 text-lg leading-8">
        Мы не смогли загрузить фотографии. Позвоните нам — с радостью расскажем, что сейчас
        происходит в центре.
      </p>
      <Button asChild className="mt-7">
        <a href={contacts.phone.href}>Позвонить в центр</a>
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="max-w-2xl rounded-3xl bg-honey-100 p-8 text-teal-700 sm:p-10">
      <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">Скоро покажем</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight">Фотоальбом наполняется</h2>
      <p className="mt-4 text-lg leading-8">
        Мы готовим фотографии, чтобы поделиться жизнью центра бережно и с разрешения семей.
      </p>
      <Button asChild className="mt-7">
        <Link href="/contacts">Связаться с центром</Link>
      </Button>
    </div>
  );
}

function Pagination({ gallery }: { gallery: Paginated<GalleryItemDto> }) {
  const pages = Math.ceil(gallery.total / gallery.pageSize);
  if (pages <= 1) return null;
  return (
    <nav
      aria-label="Страницы галереи"
      className="mt-12 flex flex-wrap items-center justify-center gap-3"
    >
      {gallery.page > 1 ? (
        <Button asChild variant="outline">
          <Link href={href(gallery.page - 1)}>Назад</Link>
        </Button>
      ) : null}
      <p className="px-3 text-sm font-black text-teal-700">
        Страница {gallery.page} из {pages}
      </p>
      {gallery.page < pages ? (
        <Button asChild variant="outline">
          <Link href={href(gallery.page + 1)}>Дальше</Link>
        </Button>
      ) : null}
    </nav>
  );
}

async function loadGallery(page: number): Promise<Paginated<GalleryItemDto> | null> {
  try {
    return await getGalleryItems(page);
  } catch {
    return null;
  }
}

function href(page: number) {
  return page === 1 ? '/gallery' : `/gallery?page=${page}`;
}

function getPhotoWord(count: number) {
  const remainder = count % 100;
  const digit = count % 10;
  if (remainder >= 11 && remainder <= 14) return 'фотографий';
  if (digit === 1) return 'фотография';
  if (digit >= 2 && digit <= 4) return 'фотографии';
  return 'фотографий';
}
