'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';

import { Button } from '@/shared/ui';

const STORAGE_KEY = 'minimishki-cookie-notice-read';

function subscribe() {
  return () => undefined;
}

function getClientSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === 'true';
}

function getServerSnapshot() {
  return false;
}

export function CookieNotice() {
  const pathname = usePathname();
  const [isDismissed, setIsDismissed] = useState(false);
  const hasReadNotice = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  function dismiss() {
    window.localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
  }

  if (hasReadNotice || isDismissed || pathname.startsWith('/admin')) return null;

  return (
    <aside
      aria-label="Уведомление об использовании cookie"
      className="fixed right-4 bottom-4 z-50 w-[min(25rem,calc(100vw-2rem))] rounded-3xl border border-teal-100 bg-cream-50/95 p-5 shadow-lifted backdrop-blur sm:right-6 sm:bottom-6"
    >
      <p className="text-lg font-black tracking-tight text-teal-700">Мы используем cookie</p>
      <p className="mt-2 text-sm leading-6 text-teal-700">
        Они помогают сайту работать и позволяют Яндекс.Метрике собирать статистику посещений.
        Подробнее — в{' '}
        <Link
          className="font-bold underline decoration-coral-400 underline-offset-3"
          href="/privacy"
        >
          Политике обработки данных
        </Link>
        .
      </p>
      <Button className="mt-4 w-full sm:w-auto" onClick={dismiss} type="button">
        Понятно
      </Button>
    </aside>
  );
}
