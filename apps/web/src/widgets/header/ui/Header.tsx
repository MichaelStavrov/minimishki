import Link from 'next/link';

import { publicNavigation } from '@/shared/config/navigation';
import { BrandMark, Button } from '@/shared/ui';

import { MobileNavigation } from './MobileNavigation';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-cream-200/80 bg-cream-50/90 backdrop-blur">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link
          href="/"
          className="group inline-flex items-center gap-3 rounded-full"
          aria-label="Минимишки — на главную"
        >
          <BrandMark priority className="transition-transform duration-200 group-hover:scale-105" />
        </Link>

        <nav aria-label="Основная навигация" className="hidden items-center gap-1 lg:flex">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-base font-extrabold text-teal-700 transition-colors hover:bg-teal-50 hover:text-teal-600"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden sm:block">
          <Button asChild className="text-base">
            <Link href="/#lead">Записаться</Link>
          </Button>
        </div>

        <MobileNavigation />
      </div>
    </header>
  );
}
