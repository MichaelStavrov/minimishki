import Link from 'next/link';
import type { ServiceDto, TeacherDto } from '@minimishki/shared';

import { LeadForm } from '@/features/submit-lead';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui';

import { getHealth } from '../api/get-health';
import { getServices } from '../api/get-services';
import { getTeachers } from '../api/get-teachers';

const promises = [
  'Занятия, игра и праздники в одном месте',
  'Внимательные педагоги и небольшой формат групп',
  'Повод для радости в обычный день',
] as const;

export async function HomePage() {
  const [health, services, teachers] = await Promise.all([
    loadHealth(),
    loadServices(),
    loadTeachers(),
  ]);

  return (
    <main>
      <section className="relative overflow-hidden px-5 pt-12 pb-18 sm:px-8 sm:pt-18 sm:pb-24 lg:pt-24 lg:pb-30">
        <div
          aria-hidden="true"
          className="absolute top-12 -left-20 size-56 rounded-full bg-honey-400/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute top-0 -right-16 size-72 rounded-[45%] bg-coral-100/70 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-[43%] size-40 rounded-full border-[18px] border-teal-100/70"
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-honey-100 px-4 py-2 text-sm font-black text-teal-700">
              <span aria-hidden="true" className="size-2 rounded-full bg-coral-400" />
              Здесь начинается хорошее детство
            </p>

            <h1 className="mt-6 text-5xl font-black tracking-[-0.055em] text-teal-700 sm:text-6xl lg:text-7xl">
              Каждый день —<span className="block text-coral-400">маленькое приключение</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-teal-700 sm:text-xl">
              «Минимишки» — место для игры, творчества, новых друзей и тёплых семейных воспоминаний.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="#services">Выбрать занятие</Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/contacts">Узнать о центре</Link>
              </Button>
            </div>

            <ul className="mt-10 grid gap-3 text-sm font-bold text-teal-700 sm:grid-cols-3">
              {promises.map((promise) => (
                <li key={promise} className="flex gap-2 leading-5">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-honey-400"
                  />
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[3rem] bg-teal-700 p-6 shadow-lifted sm:p-8">
              <div
                aria-hidden="true"
                className="absolute -top-16 -right-14 size-64 rounded-full bg-honey-400"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -left-18 size-60 rounded-[44%] bg-coral-400"
              />

              <div className="relative flex h-full flex-col justify-between rounded-[2rem] border border-cream-50/30 bg-teal-600/80 p-6 text-cream-50 backdrop-blur-sm sm:p-8">
                <p className="max-w-55 text-lg leading-6 font-black">
                  Не просто занятия. Свой маленький мир.
                </p>

                <div className="self-end rounded-2xl bg-cream-50 p-5 text-ink shadow-soft">
                  <p className="text-sm font-extrabold text-teal-700">Сегодня можно</p>
                  <p className="mt-1 text-2xl font-black tracking-tight">
                    играть, дружить, творить
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-7 -left-3 rounded-2xl bg-cream-50 px-5 py-4 shadow-lifted sm:-left-8">
              <p className="text-xs font-black tracking-[0.12em] text-coral-400 uppercase">
                Рядом с родителями
              </p>
              <p className="mt-1 text-sm font-bold text-teal-700">и в своём темпе</p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="scroll-mt-24 bg-teal-700 px-5 py-16 text-cream-50 sm:px-8 sm:py-20"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
                Найдём своё
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                У каждого ребёнка — свой способ загораться
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-7 text-cream-100 sm:text-lg">
              Регулярные занятия, свободная игра, праздники и творческие события. Начните с того,
              что сейчас особенно интересно вашему ребёнку.
            </p>
          </div>

          {services.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {services.map((service) => (
                <Card key={service.id} className="flex min-h-full flex-col border-0">
                  <CardHeader>
                    <p className="text-sm font-black tracking-[0.12em] text-coral-400 uppercase">
                      {formatAge(service)}
                    </p>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <CardDescription className="text-base leading-7">
                      {service.summary ??
                        'Подробности программы скоро появятся на странице услуги.'}
                    </CardDescription>
                  </CardContent>

                  <CardFooter>
                    <Button asChild variant="ghost" className="px-0">
                      <Link href={`/services/${service.slug}`}>Подробнее</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-10 max-w-2xl text-lg leading-8 text-cream-100">
              Направления скоро появятся здесь. А пока свяжитесь с нами — подскажем подходящий
              формат для ребёнка.
            </p>
          )}

          <Button asChild variant="secondary" size="lg" className="mt-10">
            <Link href="/services">Смотреть все услуги</Link>
          </Button>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
                Рядом с ребёнком
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
                Педагоги, которым можно доверять
              </h2>
            </div>

            <p className="max-w-2xl text-base leading-7 text-teal-700 sm:text-lg">
              Наблюдаем, поддерживаем, замечаем сильные стороны и помогаем детям пробовать новое без
              спешки.
            </p>
          </div>

          {teachers.length > 0 ? (
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {teachers.map((teacher) => (
                <Card
                  key={teacher.id}
                  className="flex min-h-full flex-col border-0 bg-cream-100 shadow-none"
                >
                  <CardHeader className="flex-row items-center gap-5">
                    <div
                      aria-hidden="true"
                      className="flex size-16 shrink-0 items-center justify-center rounded-[1.4rem] bg-teal-700 text-xl font-black text-cream-50 shadow-soft"
                    >
                      {getInitials(teacher.fullName)}
                    </div>

                    <div>
                      <CardTitle>{teacher.fullName}</CardTitle>
                      <p className="mt-1 text-sm font-extrabold text-coral-400">
                        {teacher.position}
                      </p>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <CardDescription className="text-base leading-7">
                      {teacher.bio ?? 'Скоро расскажем о педагоге и его занятиях подробнее.'}
                    </CardDescription>
                  </CardContent>

                  <CardFooter>
                    <Button asChild variant="ghost" className="px-0">
                      <Link href={`/teachers/${teacher.slug}`}>Познакомиться</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <p className="mt-10 max-w-2xl text-lg leading-8 text-teal-700">
              Мы скоро познакомим вас с педагогами центра.
            </p>
          )}

          <Button asChild variant="outline" size="lg" className="mt-10">
            <Link href="/teachers">Все педагоги</Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-cream-200 bg-cream-50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              Приходите в гости
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
              Мы рядом — в центре Пушкино
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-teal-700">
              Можно заранее позвонить, чтобы уточнить свободное время и выбрать удобный формат
              знакомства.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <address className="rounded-2xl bg-teal-700 p-6 text-cream-50 not-italic shadow-lifted">
              <p className="text-sm font-black tracking-[0.12em] text-honey-400 uppercase">Адрес</p>
              <p className="mt-4 text-lg font-extrabold">МО, г. Пушкино</p>
              <p className="mt-1 leading-6 text-cream-100">Московский просп., дом 59</p>
              <p className="leading-6 text-cream-100">ТЦ «Круиз», 3 этаж</p>
            </address>

            <div className="rounded-2xl bg-honey-100 p-6 text-teal-700">
              <p className="text-sm font-black tracking-[0.12em] text-coral-400 uppercase">
                На связи
              </p>
              <a
                href="tel:+79999288148"
                className="mt-4 inline-flex text-xl font-black tracking-tight underline decoration-coral-400 decoration-2 underline-offset-4"
              >
                +7 (999) 928-81-48
              </a>
              <p className="mt-3 text-sm leading-6">
                Ежедневно с 11:00 до 20:00
                <br />
                Аренда зала — до 21:00
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="lead" className="scroll-mt-24 bg-teal-50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <div>
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              Первый шаг
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
              Давайте познакомимся
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-8 text-teal-700">
              Расскажите о ребёнке, а мы подберём формат, в котором будет интересно именно ему.
            </p>

            <div className="mt-8 rounded-2xl bg-teal-700 p-6 text-cream-50 shadow-lifted">
              <p className="text-sm font-black tracking-[0.12em] text-honey-400 uppercase">
                Можно и по телефону
              </p>
              <a
                href="tel:+79999288148"
                className="mt-3 inline-flex text-2xl font-black tracking-tight underline decoration-honey-400 decoration-2 underline-offset-4"
              >
                +7 (999) 928-81-48
              </a>
              <p className="mt-3 text-sm leading-6 text-cream-100">Ежедневно с 11:00 до 20:00</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-cream-50 p-6 shadow-soft sm:p-8">
            <LeadForm services={services} />
          </div>
        </div>

        <p
          className="mx-auto mt-8 w-full max-w-7xl text-center text-xs font-semibold text-teal-700/70"
          aria-live="polite"
        >
          {health
            ? 'Сайт связан с работающей системой центра.'
            : 'Сайт работает в режиме обновления данных центра.'}
        </p>
      </section>
    </main>
  );
}

async function loadHealth() {
  try {
    return await getHealth();
  } catch {
    return undefined;
  }
}

async function loadServices(): Promise<ServiceDto[]> {
  try {
    const services = await getServices();

    return services.items;
  } catch {
    return [];
  }
}

async function loadTeachers(): Promise<TeacherDto[]> {
  try {
    const teachers = await getTeachers();

    return teachers.items;
  } catch {
    return [];
  }
}

function formatAge(service: ServiceDto): string {
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

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');
}
