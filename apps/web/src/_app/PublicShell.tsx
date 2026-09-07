'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

type Props = {
  children: ReactNode;
};

/** Админка использует собственный shell и не должна наследовать публичную навигацию. */
export function PublicShell({ children }: Props) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return children;
  }

  return (
    <>
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
