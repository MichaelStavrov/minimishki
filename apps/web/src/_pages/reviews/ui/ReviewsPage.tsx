import Link from 'next/link';
import type { Paginated, ReviewDto } from '@minimishki/shared';

import { ReviewForm } from '@/features/submit-review';

import { Button, Card, CardContent, CardHeader } from '@/shared/ui';

import { getReviews } from '../api/get-reviews';

export async function ReviewsPage({ page }: { page: number }) {
  const reviews = await loadReviews(page);
  return (
    <main>
      <section className="bg-teal-700 px-5 py-16 text-cream-50 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
            Мнение семей
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em] sm:text-6xl">
            Отзывы о «Минимишках»
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream-100 sm:text-xl">
            Читаем каждое сообщение — и благодарность, и честные идеи, как стать лучше.
          </p>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
            {reviews === null ? (
              <State
                title="Отзывы временно недоступны"
                text="Попробуйте обновить страницу немного позже."
              />
            ) : reviews.total === 0 ? (
              <State
                title="Пока нет опубликованных отзывов"
                text="Первый отзыв появится здесь после проверки."
              />
            ) : (
              <ReviewList reviews={reviews} />
            )}
          </div>
          <aside className="h-fit rounded-3xl bg-cream-100 p-6 sm:p-8">
            <h2 className="text-3xl font-black text-teal-700">Поделитесь впечатлением</h2>
            <p className="mt-3 leading-7 text-teal-700">
              Email не публикуем. Отзыв сначала проверит сотрудник центра.
            </p>
            <div className="mt-6">
              <ReviewForm />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function ReviewList({ reviews }: { reviews: Paginated<ReviewDto> }) {
  return (
    <>
      <div className="grid gap-4">
        {reviews.items.map((review) => (
          <Card key={review.id} className="border-0 bg-cream-100">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black text-teal-700">{review.name}</h2>
                {review.rating === null ? null : (
                  <p
                    className="font-black text-coral-400"
                    aria-label={`Оценка ${review.rating} из 5`}
                  >
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </p>
                )}
              </div>
              <p className="text-sm font-bold text-teal-600">
                {new Intl.DateTimeFormat('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }).format(new Date(review.createdAt))}
              </p>
            </CardHeader>
            <CardContent>
              <p className="leading-7 whitespace-pre-wrap text-teal-700">{review.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Pagination reviews={reviews} />
    </>
  );
}

function Pagination({ reviews }: { reviews: Paginated<ReviewDto> }) {
  const totalPages = Math.ceil(reviews.total / reviews.pageSize);
  if (totalPages < 2) return null;
  return (
    <nav className="mt-8 flex gap-3" aria-label="Страницы отзывов">
      {reviews.page > 1 ? (
        <Button asChild variant="outline">
          <Link href={reviews.page === 2 ? '/reviews' : `/reviews?page=${reviews.page - 1}`}>
            Назад
          </Link>
        </Button>
      ) : null}
      {reviews.page < totalPages ? (
        <Button asChild variant="outline">
          <Link href={`/reviews?page=${reviews.page + 1}`}>Далее</Link>
        </Button>
      ) : null}
    </nav>
  );
}
function State({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl bg-teal-50 p-8 text-teal-700">
      <h2 className="text-3xl font-black">{title}</h2>
      <p className="mt-4 text-lg leading-8">{text}</p>
    </div>
  );
}
async function loadReviews(page: number): Promise<Paginated<ReviewDto> | null> {
  try {
    return await getReviews(page);
  } catch {
    return null;
  }
}
