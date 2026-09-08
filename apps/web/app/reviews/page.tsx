import type { Metadata } from 'next';

import { ReviewsPage } from '@/_pages/reviews/index.server';

export const metadata: Metadata = {
  title: 'Отзывы',
  description: 'Отзывы семей о занятиях и праздниках в детском центре «Минимишки».',
};

export default async function ReviewsRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const parsedPage = Number(page);
  return <ReviewsPage page={Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1} />;
}
