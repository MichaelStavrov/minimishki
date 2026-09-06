import Link from 'next/link';
import type { PartyCategoryDto, PartyItemDto, PriceType } from '@minimishki/shared';

import { Button, Card, CardContent, CardHeader } from '@/shared/ui';

import { getPartyCategories } from '../api/get-party-categories';

export async function PartiesPage() {
  const categories = await loadCategories();

  return (
    <main>
      <section className="relative overflow-hidden bg-teal-700 px-5 pt-14 pb-20 text-cream-50 sm:px-8 sm:pt-20 sm:pb-28">
        <div
          aria-hidden="true"
          className="absolute -top-20 right-[8%] size-72 rounded-full bg-honey-400/70 blur-2xl"
        />
        <div className="relative mx-auto w-full max-w-7xl">
          <p className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
            Детские праздники
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em] sm:text-6xl">
            Праздник, который ребёнок будет вспоминать
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-cream-100 sm:text-xl">
            Игровая зона, герои, шоу и творчество — соберём программу для вашей семьи.
          </p>
          <Button asChild variant="secondary" size="lg" className="mt-8">
            <Link href="/#lead">Обсудить праздник</Link>
          </Button>
        </div>
      </section>
      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-7xl">
          {categories === null ? (
            <State title="Прайс временно недоступен" />
          ) : categories.length === 0 ? (
            <State title="Готовим актуальный праздничный прайс" />
          ) : (
            categories.map((category) => <Category key={category.id} category={category} />)
          )}
        </div>
      </section>
    </main>
  );
}
function Category({ category }: { category: PartyCategoryDto }) {
  return (
    <section className="mb-14 last:mb-0">
      <h2 className="text-3xl font-black text-teal-700">{category.title}</h2>
      {category.description ? (
        <p className="mt-3 text-lg text-teal-700">{category.description}</p>
      ) : null}
      <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {category.items?.map((item) => (
          <Card key={item.id} className="border-0 bg-cream-100">
            <CardHeader>
              <h3 className="text-xl font-black text-teal-700">{item.title}</h3>
              <p className="text-2xl font-black text-coral-400">{formatPrice(item)}</p>
            </CardHeader>
            {item.descriptionHtml !== null ? (
              <CardContent className="pt-4">
                <div
                  className="text-sm leading-6 text-teal-700 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: item.descriptionHtml }}
                />
              </CardContent>
            ) : null}
          </Card>
        ))}
      </div>
    </section>
  );
}
function State({ title }: { title: string }) {
  return (
    <div className="max-w-2xl rounded-3xl bg-teal-50 p-8 text-teal-700">
      <h2 className="text-3xl font-black">{title}</h2>
      <p className="mt-4 text-lg leading-8">
        Позвоните нам — подберём программу и сориентируем по стоимости.
      </p>
    </div>
  );
}
async function loadCategories(): Promise<PartyCategoryDto[] | null> {
  try {
    return await getPartyCategories();
  } catch {
    return null;
  }
}
function formatPrice(item: Pick<PartyItemDto, 'priceType' | 'amount' | 'priceUnit'>) {
  const labels: Record<PriceType, string> = {
    FIXED: '',
    FROM: 'от ',
    FREE: 'Бесплатно',
    INCLUDED: 'Включено',
    ON_REQUEST: 'По запросу',
  };
  if (item.priceType === 'FREE' || item.priceType === 'INCLUDED' || item.priceType === 'ON_REQUEST')
    return labels[item.priceType];
  const amount =
    item.amount === null
      ? 'по запросу'
      : new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          maximumFractionDigits: item.amount % 100 === 0 ? 0 : 2,
        }).format(item.amount / 100);
  return `${labels[item.priceType]}${amount}${item.priceUnit ? ` ${item.priceUnit}` : ''}`;
}
