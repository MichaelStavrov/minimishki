'use client';

/* Скрытый fallback Метрики должен оставаться обычным img внутри noscript. */
/* eslint-disable @next/next/no-img-element */

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

type YandexMetrikaProps = { counterId: string };

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: unknown[]) => void;
  }
}

export function YandexMetrika({ counterId }: YandexMetrikaProps) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    window.ym?.(Number(counterId), 'hit', `${pathname}${search ? `?${search}` : ''}`);
  }, [counterId, pathname, search]);

  if (pathname.startsWith('/admin')) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${counterId},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`}
      </Script>
      <noscript>
        <div>
          <img
            alt=""
            src={`https://mc.yandex.ru/watch/${counterId}`}
            style={{ position: 'absolute', left: '-9999px' }}
          />
        </div>
      </noscript>
    </>
  );
}
