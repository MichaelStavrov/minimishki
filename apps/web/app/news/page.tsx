import { NewsPage } from '@/_pages/news/index.server';

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
