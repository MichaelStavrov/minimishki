import type { Metadata } from 'next';

import { AdminLoginPage } from '@/_pages/admin-login/index.server';

export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ next?: string }> };

export default async function Page({ searchParams }: Props) {
  const { next } = await searchParams;
  const nextPath = next === '/admin' || next?.startsWith('/admin/') ? next : '/admin';

  return <AdminLoginPage nextPath={nextPath} />;
}
