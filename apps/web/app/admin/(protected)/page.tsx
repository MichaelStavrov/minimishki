import { redirect } from 'next/navigation';

import { AdminHomePage } from '@/_pages/admin-home/index.server';

import { getAdminSessionUser } from '@/shared/api/admin-session.server';

export default async function Page() {
  const user = await getAdminSessionUser();

  if (!user) {
    redirect('/admin/login');
  }

  return <AdminHomePage user={user} />;
}
