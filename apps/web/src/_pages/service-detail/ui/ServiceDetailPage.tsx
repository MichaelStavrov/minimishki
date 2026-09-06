import Link from 'next/link';
import { notFound } from 'next/navigation';
import type {
  DayOfWeek,
  PriceType,
  ServiceDto,
  ServiceOfferDto,
  ServiceScheduleDto,
} from '@minimishki/shared';

import { LeadForm } from '@/features/submit-lead';

import { getServiceBySlug } from '@/entities/service/index.server';

import { ApiError } from '@/shared/api/index.server';
import { Button, Card, CardContent, CardFooter, CardHeader } from '@/shared/ui';

type ServiceDetailPageProps = {
  slug: string;
};

const dayLabels: Record<DayOfWeek, string> = {
  MONDAY: 'Пн',
  TUESDAY: 'Вт',
  WEDNESDAY: 'Ср',
  THURSDAY: 'Чт',
  FRIDAY: 'Пт',
  SATURDAY: 'Сб',
  SUNDAY: 'Вс',
};

export async function ServiceDetailPage({ slug }: ServiceDetailPageProps) {
  const service = await loadService(slug);
  const offerGroups = service.offerGroups ?? [];
  const schedules = service.schedules ?? [];
  const teachers = service.teachers ?? [];
  const hasRecurringSchedule = schedules.some((schedule) => schedule.scheduleType === 'RECURRING');

  return (
    <main>
      <section className="relative overflow-hidden bg-teal-700 px-5 pt-12 pb-18 text-cream-50 sm:px-8 sm:pt-18 sm:pb-24">
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-12 size-72 rounded-full bg-honey-400"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 -left-16 size-80 rounded-[44%] bg-coral-400"
        />

        <div className="relative mx-auto w-full max-w-7xl">
          <Link
            href="/services"
            className="inline-flex text-sm font-extrabold text-honey-400 underline decoration-honey-400/50 underline-offset-4 hover:text-cream-50 focus-visible:ring-[3px] focus-visible:ring-honey-400/60 focus-visible:outline-none"
          >
            ← Все направления
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
                {formatAge(service)}
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                {service.title}
              </h1>
              {service.summary !== null ? (
                <p className="mt-6 max-w-2xl text-lg leading-8 text-cream-100 sm:text-xl">
                  {service.summary}
                </p>
              ) : null}
            </div>

            <div className="rounded-[2rem] border border-cream-50/20 bg-teal-600/80 p-6 backdrop-blur-sm sm:p-8">
              <p className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
                Первый шаг
              </p>
              <p className="mt-3 text-2xl font-black tracking-tight">
                Познакомимся и выберем удобный формат
              </p>
              <Button asChild variant="secondary" size="lg" className="mt-6">
                <Link href="#lead">Оставить заявку</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              О направлении
            </p>
            <div
              className="mt-5 space-y-4 text-lg leading-8 text-teal-700 [&_a]:font-extrabold [&_a]:text-coral-400 [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-8 [&_h2]:text-3xl [&_h2]:font-black [&_h2]:tracking-tight [&_h3]:mt-6 [&_h3]:text-2xl [&_h3]:font-black [&_p]:max-w-3xl [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: service.contentHtml }}
            />
          </div>

          <aside className="rounded-[2rem] bg-cream-100 p-6 text-teal-700 sm:p-8">
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              В двух словах
            </p>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-sm font-bold text-teal-700/70">Возраст</dt>
                <dd className="mt-1 text-xl font-black">{formatAge(service)}</dd>
              </div>
              <div>
                <dt className="text-sm font-bold text-teal-700/70">Формат</dt>
                <dd className="mt-1 text-xl font-black">
                  {hasRecurringSchedule ? 'Регулярные занятия' : 'По согласованию'}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {offerGroups.length > 0 ? (
        <section className="bg-teal-50 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              Форматы и стоимость
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
              Выберите подходящий ритм
            </h2>

            <div className="mt-10 space-y-10">
              {offerGroups.map((group) => (
                <div key={group.id}>
                  <h3 className="text-2xl font-black tracking-tight text-teal-700">
                    {group.title}
                  </h3>

                  {group.descriptionHtml !== null ? (
                    <div
                      className="mt-3 max-w-3xl text-base leading-7 text-teal-700 [&_a]:font-extrabold [&_a]:text-coral-400 [&_a]:underline [&_a]:underline-offset-4 [&_p+p]:mt-3"
                      dangerouslySetInnerHTML={{ __html: group.descriptionHtml }}
                    />
                  ) : null}

                  {(group.offers ?? []).length > 0 ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {group.offers?.map((offer) => (
                        <OfferCard key={offer.id} offer={offer} />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {schedules.length > 0 ? (
        <section className="px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              Расписание
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
              Встречаемся без спешки
            </h2>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {schedules.map((schedule) => (
                <Card key={schedule.id} className="border-0 bg-cream-100 shadow-none">
                  <CardHeader>
                    <p className="text-xl font-black text-teal-700">{formatSchedule(schedule)}</p>
                  </CardHeader>
                  {formatSchedulePeriod(schedule) !== null ? (
                    <CardContent className="pt-4">
                      <p className="text-sm font-bold text-teal-700/70">
                        {formatSchedulePeriod(schedule)}
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {teachers.length > 0 ? (
        <section className="bg-cream-100 px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto w-full max-w-7xl">
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              Рядом с ребёнком
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
              Педагоги направления
            </h2>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {teachers.map((teacher) => (
                <Card key={teacher.id} className="border-0 bg-cream-50">
                  <CardHeader className="flex-row items-center gap-4">
                    <div
                      aria-hidden="true"
                      className="flex size-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-teal-700 text-lg font-black text-cream-50"
                    >
                      {getInitials(teacher.fullName)}
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-teal-700">
                        {teacher.fullName}
                      </h3>
                      <p className="mt-1 text-sm font-extrabold text-coral-400">
                        {teacher.position}
                      </p>
                    </div>
                  </CardHeader>
                  {teacher.bio !== null ? (
                    <CardContent className="pt-4">
                      <p className="leading-7 text-teal-700">{teacher.bio}</p>
                    </CardContent>
                  ) : null}
                  <CardFooter>
                    <Button asChild variant="ghost" className="px-0">
                      <Link href={`/teachers/${teacher.slug}`}>Познакомиться</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="lead" className="scroll-mt-24 bg-teal-50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              Попробуем вместе
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
              Оставьте заявку на знакомство
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-teal-700">
              Подскажем, с чего начать, и ответим на вопросы о направлении.
            </p>
          </div>

          <div className="rounded-[2rem] bg-cream-50 p-6 shadow-soft sm:p-8">
            <LeadForm services={[service]} />
          </div>
        </div>
      </section>
    </main>
  );
}

function OfferCard({ offer }: { offer: ServiceOfferDto }) {
  return (
    <Card className="flex min-h-full flex-col border-0 bg-cream-50">
      <CardHeader>
        <h4 className="text-xl font-black tracking-tight text-teal-700">{offer.title}</h4>
        <p className="text-2xl font-black text-coral-400">{formatPrice(offer)}</p>
      </CardHeader>
      {offer.descriptionHtml !== null ? (
        <CardContent className="flex-1 pt-4">
          <div
            className="text-sm leading-6 text-teal-700 [&_p+p]:mt-3"
            dangerouslySetInnerHTML={{ __html: offer.descriptionHtml }}
          />
        </CardContent>
      ) : null}
      {offer.durationMinutes !== null || offer.priceNote !== null ? (
        <CardFooter className="mt-auto flex-col items-start gap-1">
          {offer.durationMinutes !== null ? (
            <p className="text-sm font-bold text-teal-700/70">
              {formatDuration(offer.durationMinutes)}
            </p>
          ) : null}
          {offer.priceNote !== null ? (
            <p className="text-sm font-bold text-teal-700/70">{offer.priceNote}</p>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}

async function loadService(slug: string): Promise<ServiceDto> {
  try {
    return await getServiceBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}

function formatAge(service: Pick<ServiceDto, 'ageFromMonths' | 'ageToMonths' | 'ageNote'>): string {
  if (service.ageNote !== null) {
    return service.ageNote;
  }

  if (service.ageFromMonths !== null && service.ageToMonths !== null) {
    return `${formatAgeValue(service.ageFromMonths)}–${formatAgeValue(service.ageToMonths)}`;
  }

  if (service.ageFromMonths !== null) {
    return `от ${formatAgeValue(service.ageFromMonths)}`;
  }

  if (service.ageToMonths !== null) {
    return `до ${formatAgeValue(service.ageToMonths)}`;
  }

  return 'Для детей';
}

function formatAgeValue(months: number): string {
  const years = months / 12;

  if (!Number.isInteger(years)) {
    return `${years.toString().replace('.', ',')} года`;
  }

  const remainder = years % 100;
  const lastDigit = years % 10;

  if (remainder >= 11 && remainder <= 14) {
    return `${years} лет`;
  }

  if (lastDigit === 1) {
    return `${years} год`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${years} года`;
  }

  return `${years} лет`;
}

function formatPrice(offer: Pick<ServiceOfferDto, 'amount' | 'priceType' | 'priceUnit'>): string {
  const price = offer.amount === null ? null : formatRubles(offer.amount);

  const prefix: Record<PriceType, string> = {
    FIXED: '',
    FROM: 'от ',
    FREE: 'Бесплатно',
    INCLUDED: 'Включено',
    ON_REQUEST: 'По запросу',
  };

  if (
    offer.priceType === 'FREE' ||
    offer.priceType === 'INCLUDED' ||
    offer.priceType === 'ON_REQUEST'
  ) {
    return prefix[offer.priceType];
  }

  return `${prefix[offer.priceType]}${price ?? 'по запросу'}${offer.priceUnit ? ` ${offer.priceUnit}` : ''}`;
}

function formatRubles(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} мин`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  return remainder === 0 ? `${hours} ч` : `${hours} ч ${remainder} мин`;
}

function formatSchedule(schedule: ServiceScheduleDto): string {
  if (schedule.scheduleType === 'ON_REQUEST') {
    return schedule.label ?? 'По согласованию';
  }

  const days = schedule.daysOfWeek.map((day) => dayLabels[day]).join(' · ');
  const time =
    schedule.startTime !== null && schedule.endTime !== null
      ? `, ${schedule.startTime}–${schedule.endTime}`
      : '';

  return `${days}${time}`;
}

function formatSchedulePeriod(schedule: ServiceScheduleDto): string | null {
  if (schedule.validFrom === null && schedule.validUntil === null) {
    return null;
  }

  const from = schedule.validFrom === null ? null : formatDate(schedule.validFrom);
  const until = schedule.validUntil === null ? null : formatDate(schedule.validUntil);

  if (from !== null && until !== null) {
    return `С ${from} по ${until}`;
  }

  return from !== null ? `С ${from}` : `До ${until}`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00.000Z`));
}

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');
}
