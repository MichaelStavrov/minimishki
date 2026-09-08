import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Nunito } from 'next/font/google';

import { Providers } from '@/_app/providers';
import { PublicShell } from '@/_app/PublicShell';

import { getPublicSiteSettings } from '@/entities/site-settings/index.server';
import '@/_app/styles/globals.css';

const nunito = Nunito({
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Минимишки — детский центр',
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const settings = await loadSiteSettings();

  return (
    <html lang="ru" className={nunito.className}>
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <PublicShell settings={settings}>{children}</PublicShell>
        </Providers>
      </body>
    </html>
  );
}

async function loadSiteSettings() {
  try {
    return await getPublicSiteSettings();
  } catch {
    // Контентные страницы остаются доступными, даже если API временно недоступен.
    return null;
  }
}
