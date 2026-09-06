import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { TeacherDto } from '@minimishki/shared';

import { LeadLink } from '@/features/submit-lead';

import { ServiceCard } from '@/entities/service/index.server';
import { getTeacherBySlug } from '@/entities/teacher/index.server';

import { ApiError } from '@/shared/api/index.server';
import { Button } from '@/shared/ui';

type TeacherDetailPageProps = {
  slug: string;
};

export async function TeacherDetailPage({ slug }: TeacherDetailPageProps) {
  const teacher = await loadTeacher(slug);
  const services = teacher.services ?? [];

  return (
    <main>
      <section className="relative overflow-hidden bg-cream-100 px-5 pt-12 pb-18 sm:px-8 sm:pt-18 sm:pb-24">
        <div
          aria-hidden="true"
          className="absolute -top-16 -right-12 size-72 rounded-full bg-honey-400/55 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 -left-16 size-80 rounded-[44%] bg-coral-100"
        />

        <div className="relative mx-auto w-full max-w-7xl">
          <Link
            href="/teachers"
            className="inline-flex text-sm font-extrabold text-teal-700 underline decoration-coral-400/60 underline-offset-4 hover:text-coral-400 focus-visible:ring-[3px] focus-visible:ring-coral-400/60 focus-visible:outline-none"
          >
            ← Все педагоги
          </Link>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-16">
            <div className="relative mx-auto flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-[3rem] bg-teal-700 text-7xl font-black tracking-[-0.07em] text-cream-50 shadow-lifted">
              <div
                aria-hidden="true"
                className="absolute -top-16 -right-10 size-48 rounded-full bg-honey-400"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-20 -left-8 size-48 rounded-[44%] bg-coral-400"
              />
              <span className="relative">{getInitials(teacher.fullName)}</span>
            </div>

            <div>
              <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
                Педагог
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-black tracking-[-0.055em] text-teal-700 sm:text-6xl lg:text-7xl">
                {teacher.fullName}
              </h1>
              <p className="mt-4 text-xl font-extrabold text-coral-400">{teacher.position}</p>

              {teacher.bio !== null ? (
                <p className="mt-6 max-w-2xl text-lg leading-8 text-teal-700 sm:text-xl">
                  {teacher.bio}
                </p>
              ) : (
                <p className="mt-6 max-w-2xl text-lg leading-8 text-teal-700 sm:text-xl">
                  Скоро расскажем больше о подходе педагога и его занятиях.
                </p>
              )}

              <Button asChild size="lg" className="mt-8">
                <Link href="#directions">Посмотреть направления</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
          <div>
            <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
              Подход к детям
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
              Рядом, чтобы поддержать и вдохновить
            </h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-teal-700">
              Мы создаём спокойную, доброжелательную среду, где ребёнок может пробовать новое,
              задавать вопросы и радоваться своим маленьким открытиям.
            </p>
          </div>

          <aside className="rounded-[2rem] bg-teal-700 p-6 text-cream-50 shadow-lifted sm:p-8">
            <p className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
              Хотите познакомиться?
            </p>
            <p className="mt-3 text-2xl font-black tracking-tight">
              Подберём направление для первого занятия
            </p>
            <p className="mt-4 leading-7 text-cream-100">
              Расскажите о возрасте и интересах ребёнка — поможем выбрать подходящий формат.
            </p>
            <Button asChild variant="secondary" size="lg" className="mt-6">
              <LeadLink>Оставить заявку</LeadLink>
            </Button>
          </aside>
        </div>
      </section>

      <section id="directions" className="scroll-mt-24 bg-teal-50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto w-full max-w-7xl">
          <p className="text-sm font-black tracking-[0.14em] text-coral-400 uppercase">
            Направления педагога
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-teal-700 sm:text-4xl">
            Где встречаемся и занимаемся
          </h2>

          {services.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="mt-10 max-w-2xl rounded-3xl bg-cream-50 p-8 text-teal-700 sm:p-10">
              <p className="text-lg leading-8">
                Актуальные направления появятся здесь немного позже. Оставьте заявку — поможем
                подобрать занятие.
              </p>
              <Button asChild className="mt-7">
                <LeadLink>Оставить заявку</LeadLink>
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

async function loadTeacher(slug: string): Promise<TeacherDto> {
  try {
    return await getTeacherBySlug(slug);
  } catch (error) {
    if (error instanceof ApiError && error.statusCode === 404) {
      notFound();
    }

    throw error;
  }
}

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('');
}
