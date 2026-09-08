import type { Metadata } from 'next';

import { TeachersPage } from '@/_pages/teachers/index.server';

export const metadata: Metadata = {
  title: 'Педагоги',
  description: 'Познакомьтесь с педагогами детского центра «Минимишки» в Пушкино.',
};

type TeachersRouteProps = {
  searchParams: Promise<{
    page?: string | string[];
  }>;
};

export default async function TeachersRoute({ searchParams }: TeachersRouteProps) {
  const { page } = await searchParams;

  return <TeachersPage page={getPageNumber(page)} />;
}

function getPageNumber(value: string | string[] | undefined): number {
  if (typeof value !== 'string') {
    return 1;
  }

  const page = Number(value);

  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
