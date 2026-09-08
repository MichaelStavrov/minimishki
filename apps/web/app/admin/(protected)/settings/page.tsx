import { ROLE } from '@minimishki/shared';
import { redirect } from 'next/navigation';

import { SiteSettingsManager } from '@/widgets/site-settings-manager';

import { getAdminSessionUser } from '@/shared/api/admin-session.server';

/** Скрывает системный раздел от сотрудника; API остаётся окончательной проверкой доступа. */
export default async function AdminSettingsPage() {
  const user = await getAdminSessionUser();

  if (user?.role !== ROLE.MANAGER) redirect('/admin');

  return <SiteSettingsManager />;
}
