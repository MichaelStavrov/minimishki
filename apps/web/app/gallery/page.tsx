import type { Metadata } from 'next';

import { GalleryPage } from '@/_pages/gallery/index.server';

export const metadata: Metadata = {
  title: 'Галерея',
  description: 'Фотографии занятий, праздников и событий в детском центре «Минимишки».',
};

type GalleryRouteProps = {
  searchParams: Promise<{ page?: string | string[] }>;
};

export default async function GalleryRoute({ searchParams }: GalleryRouteProps) {
  const { page } = await searchParams;

  return <GalleryPage page={parsePage(page)} />;
}

function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return 1;

  const page = Number(value);

  return Number.isSafeInteger(page) ? page : 1;
}
