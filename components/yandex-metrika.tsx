'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

const YM_ID = 104700931;
const SCRIPT_SRC = `https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`;
const PRODUCTION_HOSTNAME = 'salutgrad.ru';

/**
 * Клиентский компонент Метрики:
 *  - вставляет официальный код счетчика
 *  - инициализирует его с defer:true
 *  - отправляет hit при каждом изменении маршрута (SPA-режим)
 */
export function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrlRef = useRef<string | null>(null);

  const relativeUrl = useMemo(() => {
    if (!pathname) {
      return '/';
    }
    const search = searchParams?.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  const sendHit = useCallback((url: string, attempt = 0) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.location.hostname !== PRODUCTION_HOSTNAME) {
      lastUrlRef.current = url;
      return;
    }

    const ym = (window as any).ym;
    if (typeof ym !== 'function') {
      if (attempt < 10) {
        setTimeout(() => sendHit(url, attempt + 1), 250);
      }
      return;
    }

    try {
      const absoluteUrl = `${window.location.origin}${url}`;
      const referer = lastUrlRef.current
        ? `${window.location.origin}${lastUrlRef.current}`
        : document.referrer || undefined;

      ym(YM_ID, 'hit', absoluteUrl, {
        title: document.title,
        referer,
      });
      lastUrlRef.current = url;
    } catch (error) {
      console.warn('Yandex Metrika hit error', error);
    }
  }, []);

  // Отслеживаем изменения URL и отправляем hit для вебвизора
  useEffect(() => {
    if (!relativeUrl) {
      return;
    }
    
    // Для вебвизора важно дать время на инициализацию перед первым hit
    // Особенно важно для SPA-сайтов
    const timeoutId = setTimeout(() => {
      sendHit(relativeUrl);
    }, 100); // Небольшая задержка для инициализации вебвизора
    
    return () => clearTimeout(timeoutId);
  }, [relativeUrl, sendHit]);

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','${SCRIPT_SRC}', 'ym');
            
            ym(${YM_ID}, 'init', {
              defer:true, 
              webvisor:true, 
              clickmap:true, 
              trackLinks:true, 
              accurateTrackBounce:true, 
              ecommerce:"dataLayer",
              // Отключаем отслеживание hash для SPA (используем hit вместо этого)
              trackHash:false
            });
          `,
        }}
      />
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${YM_ID}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}

