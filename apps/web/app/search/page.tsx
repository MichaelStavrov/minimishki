import { SearchPage } from '@/_pages/search/index.server';

type SearchRouteProps = {
  searchParams: Promise<{ query?: string | string[] }>;
};

export default async function SearchRoute({ searchParams }: SearchRouteProps) {
  const { query } = await searchParams;
  const value = Array.isArray(query) ? (query[0] ?? '') : (query ?? '');

  return <SearchPage query={value} />;
}
