import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Nunito } from 'next/font/google';

import { Providers } from '@/_app/providers';
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

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ru" className={nunito.className}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
