import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { AdminShell } from '@/widgets/admin-shell';

import { getAdminSessionUser } from '@/shared/api/admin-session.server';

type Props = { children: ReactNode };

export const metadata: Metadata = { robots: { index: false, follow: false } };

/** Route group исключает `/admin/login` из серверной проверки авторизации. */
export default async function AdminLayout({ children }: Props) {
  const user = await getAdminSessionUser();

  if (!user) {
    redirect('/admin/login');
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
