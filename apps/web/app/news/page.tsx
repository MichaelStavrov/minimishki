import type { Metadata } from 'next';

import { NewsPage } from '@/_pages/news/index.server';

export const metadata: Metadata = {
  title: 'Новости и события',
  description: 'Новости, анонсы событий и жизнь детского центра «Минимишки».',
};

type NewsRouteProps = { searchParams: Promise<{ page?: string | string[] }> };

export default async function NewsRoute({ searchParams }: NewsRouteProps) {
  const { page } = await searchParams;
  return <NewsPage page={parsePage(page)} />;
}

function parsePage(value: string | string[] | undefined): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
}
