'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

const YM_ID = 104700931;
const SCRIPT_SRC = `https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`;
const PRODUCTION_HOSTNAME = 'salutgrad.ru';
const WEBVISOR_INIT_DELAY = 300; // Задержка для инициализации вебвизора

/**
 * Оптимизированный клиентский компонент Метрики для SPA-сайтов:
 *  - использует defer:true (обязательно для SPA согласно документации)
 *  - использует onLoad для точного определения загрузки скрипта
 *  - отправляет hit при первой загрузке после инициализации счетчика
 *  - отправляет hit при каждом SPA-переходе между страницами
 *  - минимизирует задержки и множественные проверки
 */
export function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastUrlRef = useRef<string | null>(null);
  const isInitialLoadRef = useRef(true);
  const counterReadyRef = useRef(false);
  const initialHitSentRef = useRef(false);

  const relativeUrl = useMemo(() => {
    if (!pathname) {
      return '/';
    }
    const search = searchParams?.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  const sendHit = useCallback((url: string) => {
    if (typeof window === 'undefined') {
      return;
    }
    if (window.location.hostname !== PRODUCTION_HOSTNAME) {
      lastUrlRef.current = url;
      return;
    }

    const ym = (window as any).ym;
    if (typeof ym !== 'function') {
      return false; // Счетчик еще не готов
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
      return true;
    } catch (error) {
      console.warn('Yandex Metrika hit error', error);
      return false;
    }
  }, []);

  // Обработчик загрузки скрипта - более точный, чем периодические проверки
  const handleScriptLoad = useCallback(() => {
    // Проверяем готовность счетчика с минимальными задержками
    const checkAndSendInitialHit = (attempt = 0) => {
      const ym = (window as any).ym;
      
      if (typeof ym === 'function') {
        counterReadyRef.current = true;
        
        // Отправляем hit для первой загрузки с задержкой для вебвизора
        if (isInitialLoadRef.current && !initialHitSentRef.current) {
          setTimeout(() => {
            if (sendHit(relativeUrl)) {
              initialHitSentRef.current = true;
              isInitialLoadRef.current = false;
            }
          }, WEBVISOR_INIT_DELAY);
        }
      } else if (attempt < 10) {
        // Быстрая проверка каждые 100ms, максимум 1 секунда
        setTimeout(() => checkAndSendInitialHit(attempt + 1), 100);
      }
    };

    // Начинаем проверку сразу после загрузки скрипта
    checkAndSendInitialHit();
  }, [relativeUrl, sendHit]);

  // Отслеживаем изменения URL и отправляем hit для SPA-переходов
  useEffect(() => {
    if (!relativeUrl || isInitialLoadRef.current) {
      return;
    }

    // Проверяем, что это реально новая страница, а не просто ре-рендер
    if (lastUrlRef.current === relativeUrl) {
      return;
    }

    // Для SPA-переходов отправляем hit сразу, если счетчик готов
    // Небольшая задержка только для гарантии готовности
    if (counterReadyRef.current) {
      // Счетчик уже готов, отправляем сразу
      sendHit(relativeUrl);
    } else {
      // Счетчик еще не готов, ждем с минимальной задержкой
      const timeoutId = setTimeout(() => {
        sendHit(relativeUrl);
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [relativeUrl, sendHit]);

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        dangerouslySetInnerHTML={{
          __html: `
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','${SCRIPT_SRC}', 'ym');
            
            ym(${YM_ID}, 'init', {
              defer: true,
              clickmap: true,
              trackLinks: true,
              accurateTrackBounce: true,
              webvisor: true,
              ecommerce: "dataLayer",
              trackHash: false
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

