import type { PartyCategoryDto, PartyItemDto } from '@minimishki/shared';

import { getLines, getPhoneHref } from '@/entities/site-settings';
import { getPublicSiteSettings } from '@/entities/site-settings/index.server';

import { contacts } from '@/shared/config/contacts';
import { Button } from '@/shared/ui';

import { getPartyCategories } from '../api/get-party-categories';
import { normalizeAgeLabel, partyLeadId } from '../model/catalog';

import { PartyAgeFilter } from './PartyAgeFilter';
import { DiscussPartyLink, PartyInquiry, PartyLeadForm } from './PartyInquiry';

const rentalSlug = 'arenda-prazdnika';
const thematicSlug = 'tematicheskie-programmy';

const catalogGroups = [
  { id: 'catalog_rent', title: 'Аренда', slugs: [rentalSlug, 'interaktivnye-igry'] },
  {
    id: 'catalog_programs',
    title: 'Программы и шоу',
    slugs: ['animatory', thematicSlug, 'shou-programmy', 'diskoteki'],
  },
  {
    id: 'catalog_extras',
    title: 'Дополнения',
    slugs: ['master-klassy-i-grim', 'oformlenie-prazdnika', 'fotograf', 'sladosti'],
  },
  { id: 'catalog_offsite', title: 'Выезд', slugs: ['vyezdnye-pozdravleniya'] },
];

const currency = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' });
const wholeRubles = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const catalogLinkClassName =
  'inline-flex min-h-11 items-center rounded-xl bg-teal-50 px-3 py-2 text-sm font-bold text-teal-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2';

export async function PartiesPage() {
  const [categories, settings] = await Promise.all([
    loadCategories(),
    getPublicSiteSettings().catch(() => null),
  ]);
  const settingsPhoneHref = getPhoneHref(settings?.phone ?? null);
  const phone =
    settings?.phone && settingsPhoneHref
      ? { display: settings.phone, href: settingsPhoneHref }
      : contacts.phone;
  const address =
    getLines(settings?.address ?? null).join(', ') || contacts.addressLines.slice(1).join(', ');
  const available = categories?.filter((category) => category.items?.length) ?? [];
  const rental = available.find((category) => category.slug === rentalSlug);
  const hourlyRates = (rental?.items ?? [])
    .filter(
      (item): item is PartyItemDto & { amount: number } =>
        (item.priceType === 'FIXED' || item.priceType === 'FROM') &&
        item.amount !== null &&
        /^(?:\/\s*|(?:за|в)\s+)?час$/iu.test(item.priceUnit?.trim() ?? ''),
    )
    .sort((a, b) => a.amount - b.amount);
  const firstRate = hourlyRates[0];
  const exampleRate = hourlyRates.find((item) => item.priceType === 'FIXED');
  const groups = groupCategories(available);
  const extras = groups.find((group) => group.id === 'catalog_extras');
  const programs = groups.find((group) => group.id === 'catalog_programs');
  const priceGroup = extras ?? programs;
  const rentalDescription = rental?.description;

  return (
    <main className="scroll-mt-28">
      <PartyInquiry>
        <section className="bg-teal-700 px-5 py-9 text-cream-50 sm:px-8 md:py-14">
          <div className="mx-auto grid max-w-7xl gap-7 md:grid-cols-[minmax(0,1.6fr)_minmax(16rem,1fr)] md:items-center lg:gap-12">
            <div>
              <h1 className="max-w-[16ch] text-[clamp(2.25rem,5.2vw,4.25rem)] leading-[1.03] font-black tracking-[-0.045em]">
                Детские праздники в Пушкино
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-cream-100 sm:text-lg">
                Отметьте день рождения в игровой комнате «Минимишек». Подберём аниматора, шоу и
                мастер-класс по интересам ребёнка.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
                <Button asChild variant="secondary" size="lg">
                  <DiscussPartyLink />
                </Button>
                {groups.length > 0 ? (
                  <a
                    className="inline-flex min-h-11 items-center rounded-sm font-extrabold text-cream-50 underline decoration-honey-400 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                    href="#party_prices"
                  >
                    Смотреть цены
                  </a>
                ) : null}
              </div>
            </div>
            {firstRate ? (
              <div className="rounded-3xl bg-honey-100 px-5 py-4 text-teal-700 md:p-8">
                <p className="text-sm font-extrabold">Аренда игровой комнаты</p>
                <p className="mt-1 text-2xl leading-tight font-black tracking-tight sm:text-3xl md:text-4xl">
                  от {formatAmount(firstRate.amount)} <span className="text-base">/ час</span>
                </p>
                <p className="mt-2 text-sm leading-6 md:mt-4">{address}</p>
              </div>
            ) : null}
          </div>
        </section>

        {groups.length > 0 ? (
          <section
            id="party_prices"
            tabIndex={-1}
            className="scroll-mt-28 px-5 pt-8 pb-12 sm:px-8 sm:py-12"
          >
            <div className="mx-auto max-w-7xl">
              <h2 className="text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
                Сколько стоит праздник
              </h2>
              {firstRate || rentalDescription || priceGroup ? (
                <div className="mt-5 grid gap-3 md:flex md:[&>*]:flex-1">
                  {firstRate ? (
                    <div className="rounded-2xl bg-honey-100 p-5 text-teal-700">
                      <h3 className="text-lg font-black">Аренда</h3>
                      <p className="mt-2 text-2xl font-black">
                        от {formatAmount(firstRate.amount)} / час
                      </p>
                      {exampleRate ? (
                        <p className="mt-2 text-sm leading-relaxed">
                          Пример расчёта аренды: 2 часа по тарифу «{exampleRate.title}» —{' '}
                          {formatAmount(exampleRate.amount * 2)}.
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {rentalDescription ? (
                    <div className="rounded-2xl bg-teal-50 p-5 text-teal-700">
                      <h3 className="text-lg font-black">Что входит в аренду</h3>
                      <p className="mt-2 text-sm leading-relaxed">{rentalDescription}</p>
                    </div>
                  ) : null}
                  {priceGroup ? (
                    <div className="rounded-2xl border border-cream-200 bg-cream-50 p-5 text-teal-700">
                      <h3 className="text-lg font-black">Что можно добавить</h3>
                      <p className="mt-2 text-sm leading-relaxed">
                        Подберите программу и дополнительные услуги. Цены и условия указаны в
                        каталоге.
                      </p>
                      <a
                        href={'#' + priceGroup.id}
                        className="mt-2 inline-flex min-h-11 items-center rounded-sm text-sm font-extrabold underline decoration-teal-600/40 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4"
                      >
                        {extras ? 'Посмотреть дополнения' : 'Посмотреть программы'}
                      </a>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <nav
                aria-label="Разделы праздничного каталога"
                className="mt-7 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
              >
                {groups.map((group) => (
                  <a key={group.id} href={'#' + group.id} className={catalogLinkClassName}>
                    {group.title}
                  </a>
                ))}
              </nav>
              <div className="mt-8 space-y-10 sm:space-y-14">
                {groups.map((group) => (
                  <CatalogGroup key={group.id} group={group} />
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="px-5 py-10 sm:px-8">
            <div className="mx-auto max-w-7xl rounded-3xl bg-teal-50 p-6 text-teal-700 sm:p-8">
              <h2 className="text-2xl font-black">
                {categories === null
                  ? 'Прайс временно недоступен'
                  : 'Готовим актуальный праздничный прайс'}
              </h2>
              <p className="mt-3">Поможем выбрать программу и сориентируем по стоимости.</p>
              <Button asChild className="mt-4">
                <a href={phone.href}>Позвонить в центр</a>
              </Button>
            </div>
          </section>
        )}

        <section
          id={partyLeadId}
          tabIndex={-1}
          className="scroll-mt-28 bg-teal-50 px-5 py-9 sm:px-8 sm:py-14"
        >
          <div className="mx-auto grid max-w-7xl items-start gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-12">
            <div className="text-teal-700">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Обсудим день рождения
              </h2>
              <p className="mt-3 max-w-md leading-7">
                Подберём программу, проверим свободное время и уточним стоимость.
              </p>
              <a
                className="mt-2 inline-flex min-h-11 items-center rounded-sm font-extrabold underline decoration-teal-600/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                href={phone.href}
              >
                {phone.display}
              </a>
            </div>
            <div className="min-w-0 rounded-3xl bg-cream-50 p-4 shadow-soft sm:p-7">
              <PartyLeadForm />
            </div>
          </div>
        </section>
      </PartyInquiry>
    </main>
  );
}

type Group = { id: string; title: string; categories: PartyCategoryDto[] };

function groupCategories(categories: PartyCategoryDto[]): Group[] {
  const groups = catalogGroups.map(({ id, title, slugs }) => ({
    id,
    title,
    categories: categories.filter((category) => slugs.includes(category.slug)),
  }));
  const other = categories.filter(
    (category) => !catalogGroups.some((group) => group.slugs.includes(category.slug)),
  );
  return [
    ...groups.filter((group) => group.categories.length > 0),
    ...(other.length ? [{ id: 'catalog_other', title: 'Другие услуги', categories: other }] : []),
  ];
}

function CatalogGroup({ group }: { group: Group }) {
  const canDiscuss = group.id === 'catalog_programs' || group.id === 'catalog_offsite';
  return (
    <section
      id={group.id}
      tabIndex={-1}
      className="scroll-mt-28 border-t border-cream-200 pt-6 text-teal-700"
    >
      <h2 className="text-3xl font-black tracking-tight">{group.title}</h2>
      {group.categories.length > 1 ? (
        <nav aria-label={group.title} className="mt-2 flex flex-wrap gap-x-4">
          {group.categories.map((category) => (
            <a
              key={category.id}
              href={'#' + category.slug}
              className="inline-flex min-h-11 items-center rounded-sm text-sm font-bold underline decoration-teal-600/40 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {category.title}
            </a>
          ))}
        </nav>
      ) : null}
      <div className="mt-4 space-y-8">
        {group.categories.map((category) => (
          <Category key={category.id} category={category} canDiscuss={canDiscuss} />
        ))}
      </div>
    </section>
  );
}

function Category({ category, canDiscuss }: { category: PartyCategoryDto; canDiscuss: boolean }) {
  const cards = (category.items ?? []).map((item) => ({
    id: item.id,
    ageLabel: item.ageLabel,
    content: <PartyCard item={item} canDiscuss={canDiscuss} />,
  }));

  return (
    <section id={category.slug} tabIndex={-1} className="scroll-mt-28">
      <h3 className="text-xl font-black sm:text-2xl">{category.title}</h3>
      {category.description ? (
        <p className="mt-2 max-w-3xl leading-7">{category.description}</p>
      ) : null}
      {category.slug === thematicSlug ? (
        <PartyAgeFilter cards={cards} />
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map(({ id, content }) => (
            <div key={id} className="min-w-0">
              {content}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PartyCard({ item, canDiscuss }: { item: PartyItemDto; canDiscuss: boolean }) {
  const { amount, priceType } = item;
  const ageLabel = normalizeAgeLabel(item.ageLabel);
  const hasAmount = amount !== null && (priceType === 'FIXED' || priceType === 'FROM');
  const html = item.descriptionHtml;
  const longDescription = html !== null && html.replace(/<[^>]+>/g, ' ').trim().length > 240;
  const description = html ? (
    <div
      className="mt-3 text-sm leading-6 [&_p+p]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : null;

  return (
    <article className="rounded-2xl border border-cream-200 bg-cream-50 p-4 text-teal-700 sm:p-5">
      <h4 className="text-lg leading-snug font-black wrap-anywhere">{item.title}</h4>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm font-semibold">
        {hasAmount ? (
          <p className="text-xl font-black">
            {priceType === 'FROM' ? 'от ' : ''}
            {formatAmount(amount)}
            {item.priceUnit ? (
              <span className="text-sm font-semibold"> {item.priceUnit}</span>
            ) : null}
          </p>
        ) : (
          <p className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-extrabold">
            {priceType === 'INCLUDED'
              ? 'Включено'
              : priceType === 'FREE'
                ? 'Бесплатно'
                : 'По запросу'}
          </p>
        )}
        {ageLabel ? <span>Возраст: {ageLabel}</span> : null}
        {item.durationMinutes !== null ? <span>{item.durationMinutes} мин</span> : null}
      </div>
      {item.priceNote ? (
        <p className="mt-2 text-sm leading-6 font-semibold">{item.priceNote}</p>
      ) : null}
      {longDescription ? (
        <details className="mt-2">
          <summary className="w-fit cursor-pointer rounded-sm py-2 text-sm font-bold underline decoration-teal-600/40 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2">
            Подробнее
          </summary>
          {description}
        </details>
      ) : (
        description
      )}
      {canDiscuss ? (
        <DiscussPartyLink
          program={item.title}
          className="mt-3 inline-flex min-h-11 w-fit items-center rounded-sm text-sm font-extrabold text-teal-700 underline decoration-teal-600/40 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-4"
        />
      ) : null}
    </article>
  );
}

async function loadCategories(): Promise<PartyCategoryDto[] | null> {
  try {
    return await getPartyCategories();
  } catch {
    return null;
  }
}

function formatAmount(amount: number) {
  return (amount % 100 === 0 ? wholeRubles : currency).format(amount / 100);
}
