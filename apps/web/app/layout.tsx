import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Nunito } from 'next/font/google';

import { Providers } from '@/_app/providers';

import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';
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
      <body className="flex min-h-dvh flex-col">
        <Header />
        <div className="flex-1">
          <Providers>{children}</Providers>
        </div>
        <Footer />
      </body>
    </html>
  );
}
