'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { SiteSettingsDto } from '@minimishki/shared';

import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

type Props = {
  children: ReactNode;
  settings: SiteSettingsDto | null;
};

/** Админка использует собственный shell и не должна наследовать публичную навигацию. */
export function PublicShell({ children, settings }: Props) {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return children;
  }

  return (
    <>
      <Header settings={settings} />
      <div className="flex-1">{children}</div>
      <Footer settings={settings} />
    </>
  );
}
