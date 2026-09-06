import { ReviewsPage } from '@/_pages/reviews/index.server';

export default async function ReviewsRoute({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const parsedPage = Number(page);
  return <ReviewsPage page={Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1} />;
}
