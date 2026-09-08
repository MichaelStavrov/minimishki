import type { Metadata } from 'next';

import { SearchPage } from '@/_pages/search/index.server';

export const metadata: Metadata = { title: 'Поиск', robots: { index: false, follow: false } };

type SearchRouteProps = {
  searchParams: Promise<{ query?: string | string[] }>;
};

export default async function SearchRoute({ searchParams }: SearchRouteProps) {
  const { query } = await searchParams;
  const value = Array.isArray(query) ? (query[0] ?? '') : (query ?? '');

  return <SearchPage query={value} />;
}
