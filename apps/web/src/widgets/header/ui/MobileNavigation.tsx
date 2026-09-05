'use client';

import { useRef } from 'react';
import Link from 'next/link';

import { publicNavigation } from '@/shared/config/navigation';
import { Button } from '@/shared/ui';

export function MobileNavigation() {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    detailsRef.current?.removeAttribute('open');
  };

  return (
    <details ref={detailsRef} className="group relative lg:hidden">
      <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border-2 border-teal-600 text-teal-700 transition-colors hover:bg-teal-50 [&::-webkit-details-marker]:hidden">
        <span className="sr-only group-open:hidden">Открыть меню</span>
        <span className="sr-only hidden group-open:inline">Закрыть меню</span>
        <span aria-hidden="true" className="grid gap-1.5">
          <span className="h-0.5 w-5 rounded-full bg-current" />
          <span className="h-0.5 w-5 rounded-full bg-current" />
          <span className="h-0.5 w-5 rounded-full bg-current" />
        </span>
      </summary>

      <nav
        aria-label="Мобильная навигация"
        className="absolute top-14 right-0 flex w-[min(18rem,calc(100vw-2.5rem))] flex-col gap-1 rounded-2xl border border-cream-200 bg-cream-50 p-3 shadow-lifted"
      >
        {publicNavigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            className="rounded-xl px-4 py-3 text-base font-extrabold text-teal-700 transition-colors hover:bg-teal-50"
          >
            {item.label}
          </Link>
        ))}

        <Button asChild className="mt-2 w-full text-base">
          <Link href="/#lead" onClick={closeMenu}>
            Записаться
          </Link>
        </Button>
      </nav>
    </details>
  );
}
