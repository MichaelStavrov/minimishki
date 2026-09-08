'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROLE, type UserDto } from '@minimishki/shared';

import { Button, BrandMark } from '@/shared/ui';

type Props = {
  children: React.ReactNode;
  user: UserDto;
};

const roleLabels = {
  ADMIN: 'Администратор — заявки и контент',
  MANAGER: 'Менеджер — полный доступ',
  USER: 'Пользователь',
} as const;

export function AdminShell({ children, user }: Props) {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin-auth/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="min-h-dvh bg-cream-50 text-ink">
      <header className="border-b border-cream-200 bg-cream-50">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/admin" aria-label="Минимишки — админка" className="rounded-full">
            <BrandMark className="w-38 sm:w-44" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-extrabold text-teal-700">{user.name}</p>
              <p className="text-xs font-bold text-muted-foreground">{roleLabels[user.role]}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => void logout()}>
              Выйти
            </Button>
          </div>
        </div>
      </header>
      <nav className="border-b border-cream-200 bg-background" aria-label="Разделы админки">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 py-3 sm:px-8">
          <Link
            href="/admin"
            className="rounded-full px-4 py-2 text-sm font-extrabold text-teal-700 hover:bg-teal-50"
          >
            Заявки
          </Link>
          <Link
            href="/admin/services"
            className="rounded-full px-4 py-2 text-sm font-extrabold text-teal-700 hover:bg-teal-50"
          >
            Направления
          </Link>
          <Link
            href="/admin/teachers"
            className="rounded-full px-4 py-2 text-sm font-extrabold text-teal-700 hover:bg-teal-50"
          >
            Педагоги
          </Link>
          <Link
            href="/admin/news"
            className="rounded-full px-4 py-2 text-sm font-extrabold text-teal-700 hover:bg-teal-50"
          >
            Новости
          </Link>
          <Link
            href="/admin/gallery"
            className="rounded-full px-4 py-2 text-sm font-extrabold text-teal-700 hover:bg-teal-50"
          >
            Галерея
          </Link>
          {user.role === ROLE.MANAGER ? (
            <>
              <Link
                href="/admin/users"
                className="rounded-full px-4 py-2 text-sm font-extrabold text-teal-700 hover:bg-teal-50"
              >
                Пользователи
              </Link>
              <Link
                href="/admin/settings"
                className="rounded-full px-4 py-2 text-sm font-extrabold text-teal-700 hover:bg-teal-50"
              >
                Настройки
              </Link>
            </>
          ) : null}
        </div>
      </nav>
      <main className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 sm:py-14">{children}</main>
    </div>
  );
}
