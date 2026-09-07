import { redirect } from 'next/navigation';

import { LoginForm } from '@/features/admin-auth';

import { getAdminSessionUser } from '@/shared/api/admin-session.server';
import { BrandMark, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';

type Props = {
  nextPath: string;
};

export async function AdminLoginPage({ nextPath }: Props) {
  const user = await getAdminSessionUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <BrandMark className="w-44" />
          <CardTitle className="mt-5">Вход для сотрудников</CardTitle>
          <CardDescription>Используйте рабочий email и пароль.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm nextPath={nextPath} />
        </CardContent>
      </Card>
    </main>
  );
}
