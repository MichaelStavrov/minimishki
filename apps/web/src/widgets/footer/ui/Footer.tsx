import Link from 'next/link';

import { publicNavigation } from '@/shared/config/navigation';
import { BrandMark } from '@/shared/ui';

const phoneHref = 'tel:+79999288148';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-cream-200 bg-teal-700 text-cream-50">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.3fr_0.7fr_1fr] lg:py-16">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full"
            aria-label="Минимишки — на главную"
          >
            <BrandMark className="bg-honey-400 text-ink" />
            <span className="text-2xl font-black tracking-tight">Минимишки</span>
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-6 text-cream-100">
            Детский центр, где занятия, праздники и свободная игра становятся маленькими
            приключениями.
          </p>

          <a
            href={phoneHref}
            className="mt-6 inline-flex rounded-full bg-cream-50 px-5 py-3 text-sm font-extrabold text-teal-700 transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-soft"
          >
            +7 (999) 928-81-48
          </a>
        </div>

        <div>
          <h2 className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">Разделы</h2>
          <nav aria-label="Навигация в подвале" className="mt-4 flex flex-col items-start gap-2">
            {publicNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg text-sm font-bold text-cream-100 transition-colors hover:text-honey-400"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <address className="not-italic">
          <h2 className="text-sm font-black tracking-[0.14em] text-honey-400 uppercase">
            Ждём вас
          </h2>

          <p className="mt-4 text-sm leading-6 text-cream-100">
            <span className="block">МО, г. Пушкино</span>
            <span className="block">Московский просп., дом 59</span>
            <span className="block">ТЦ «Круиз», 3 этаж</span>
          </p>

          <p className="mt-4 text-sm leading-6 text-cream-100">
            Ежедневно с 11:00 до 20:00
            <br />
            Аренда зала — до 21:00
          </p>
        </address>
      </div>

      <div className="border-t border-cream-50/15">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 py-5 text-xs font-semibold text-cream-100 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Детский центр «Минимишки»</p>
          <p>ИП Ставров Михаил Николаевич · ИНН 503815758966</p>
        </div>
      </div>
    </footer>
  );
}
