import { ServicesPage } from '@/_pages/services/index.server';

type ServicesRouteProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function ServicesRoute({ searchParams }: ServicesRouteProps) {
  const { page } = await searchParams;

  return <ServicesPage page={getPageNumber(page)} />;
}

function getPageNumber(value: string | string[] | undefined): number {
  if (typeof value !== 'string') {
    return 1;
  }

  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
