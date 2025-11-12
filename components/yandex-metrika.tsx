'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const YM_ID = 104700931;
const PRODUCTION_HOSTNAME = 'salutgrad.ru';
const SCRIPT_SRC = `https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`;

/**
 * Компонент для загрузки и управления Яндекс.Метрикой в SPA.
 *  - Инициализирует счётчик с defer:true (без автоматических просмотров)
 *  - Отправляет hit при каждом изменении маршрута
 */
export function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastSentUrlRef = useRef<string | null>(null);

  const relativeUrl = useMemo(() => {
    if (!pathname) {
      return '/';
    }
    const search = searchParams?.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.location.hostname !== PRODUCTION_HOSTNAME) {
      return;
    }

    const w = window as any;
    const initFlagKey = `__ymInit_${YM_ID}`;

    const ensureYmFunction = () => {
      if (typeof w.ym === 'function') {
        return w.ym;
      }

      const queueFn: any = function (...args: unknown[]) {
        (queueFn.a = queueFn.a || []).push(args);
      };
      queueFn.l = Number(new Date());
      w.ym = queueFn;

      return queueFn;
    };

    const ymFn = ensureYmFunction();

    if (!w[initFlagKey]) {
      try {
        ymFn(YM_ID, 'init', {
          defer: true,
          webvisor: true,
          clickmap: true,
          trackLinks: true,
          ecommerce: 'dataLayer',
          accurateTrackBounce: true,
        });
        w[initFlagKey] = true;
      } catch (error) {
        console.warn('Yandex Metrika: init error', error);
      }
    }

    if (!document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = SCRIPT_SRC;
      script.onerror = function (error) {
        console.warn('Yandex Metrika: script load error', error);
      };

      const firstScript = document.getElementsByTagName('script')[0];
      if (firstScript?.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else {
        document.head.appendChild(script);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.location.hostname !== PRODUCTION_HOSTNAME) {
      return;
    }
    if (!relativeUrl) {
      return;
    }

    const w = window as any;
    if (typeof w.ym !== 'function') {
      return;
    }

    if (lastSentUrlRef.current === relativeUrl) {
      return;
    }

    const absoluteUrl = `${window.location.origin}${relativeUrl}`;
    const referer = lastSentUrlRef.current
      ? `${window.location.origin}${lastSentUrlRef.current}`
      : document.referrer || undefined;

    try {
      w.ym(
        YM_ID,
        'hit',
        absoluteUrl,
        referer
          ? {
              referer,
              title: document.title,
            }
          : {
              title: document.title,
            }
      );
      lastSentUrlRef.current = relativeUrl;
    } catch (error) {
      console.warn('Yandex Metrika: hit error', error);
    }
  }, [relativeUrl]);

  return (
    <>
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

