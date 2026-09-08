import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Nunito } from 'next/font/google';

import { Providers } from '@/_app/providers';
import { PublicShell } from '@/_app/PublicShell';

import { CookieNotice } from '@/widgets/cookie-notice';
import { YandexMetrika } from '@/widgets/yandex-metrika';

import { getPublicSiteSettings } from '@/entities/site-settings/index.server';

import { JsonLd } from '@/shared/ui';
import '@/_app/styles/globals.css';

const nunito = Nunito({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Минимишки — детский центр в Пушкино', template: '%s | Минимишки' },
  description:
    'Детский центр «Минимишки» в Пушкино: занятия, праздники, педагоги и тёплая забота о детях.',
  openGraph: { locale: 'ru_RU', siteName: 'Минимишки', type: 'website' },
  twitter: { card: 'summary' },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const settings = await loadSiteSettings();
  const metrikaCounterId = getMetrikaCounterId();

  return (
    <html lang="ru" className={nunito.className}>
      <body className="flex min-h-dvh flex-col">
        <JsonLd data={getLocalBusinessSchema(settings)} />
        <Providers>
          <PublicShell settings={settings}>{children}</PublicShell>
        </Providers>
        <CookieNotice />
        {metrikaCounterId ? <YandexMetrika counterId={metrikaCounterId} /> : null}
      </body>
    </html>
  );
}

function getMetrikaCounterId(): string | null {
  const counterId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  return counterId && /^\d+$/.test(counterId) ? counterId : null;
}

function getLocalBusinessSchema(settings: Awaited<ReturnType<typeof loadSiteSettings>>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ChildCare',
    name: 'Детский центр «Минимишки»',
    telephone: settings?.phone ?? undefined,
    email: settings?.email ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.address ?? 'Московский проспект, дом 59, ТЦ «Круиз», 3 этаж',
      addressLocality: 'Пушкино',
      addressRegion: 'Московская область',
      addressCountry: 'RU',
    },
    sameAs: [settings?.vkUrl, settings?.telegramUrl, settings?.whatsappUrl].filter(
      (url): url is string => url !== null && url !== undefined,
    ),
  };
}

async function loadSiteSettings() {
  try {
    return await getPublicSiteSettings();
  } catch {
    // Контентные страницы остаются доступными, даже если API временно недоступен.
    return null;
  }
}
