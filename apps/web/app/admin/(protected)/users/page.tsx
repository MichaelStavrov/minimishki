import { ROLE } from '@minimishki/shared';
import { redirect } from 'next/navigation';

import { UsersManager } from '@/widgets/users-manager';

import { getAdminSessionUser } from '@/shared/api/admin-session.server';

/** API остаётся окончательной проверкой, а редирект не показывает раздел сотруднику без доступа. */
export default async function AdminUsersPage() {
  const user = await getAdminSessionUser();

  if (user?.role !== ROLE.MANAGER) {
    redirect('/admin');
  }

  return <UsersManager />;
}
