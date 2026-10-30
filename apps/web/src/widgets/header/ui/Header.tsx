import Link from 'next/link';
import type { SiteSettingsDto } from '@minimishki/shared';

import { LeadLink } from '@/features/submit-lead';

import { getPhoneHref } from '@/entities/site-settings';

import { publicNavigation } from '@/shared/config/navigation';
import { BrandMark, Button } from '@/shared/ui';

import { MobileNavigation } from './MobileNavigation';
import { NavigationLink } from './NavigationLink';

export function Header({ settings }: { settings: SiteSettingsDto | null }) {
  const phoneHref = getPhoneHref(settings?.phone ?? null);

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
            <NavigationLink
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-base font-extrabold text-teal-700 transition-colors hover:bg-teal-50 hover:text-teal-600"
            >
              {item.label}
            </NavigationLink>
          ))}
        </nav>

        {settings?.phone && phoneHref ? (
          <a
            href={phoneHref}
            className="hidden shrink-0 rounded-xl px-2 py-1 text-sm font-black whitespace-nowrap text-teal-700 underline decoration-honey-400 decoration-2 underline-offset-4 xl:block"
          >
            {settings.phone}
          </a>
        ) : null}

        <div className="hidden sm:block">
          <Button asChild className="text-base">
            <LeadLink>Записаться</LeadLink>
          </Button>
        </div>

        <MobileNavigation />
      </div>
    </header>
  );
}
