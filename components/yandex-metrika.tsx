'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';

const YM_ID = 104700931;
const SCRIPT_SRC = `https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}`;
const PRODUCTION_HOSTNAME = 'salutgrad.ru';

// Типизация для Яндекс Метрики
declare global {
  interface Window {
    ym?: (
      counterId: number,
      method: string,
      ...args: any[]
    ) => void;
  }
}

/**
 * Клиентский компонент Метрики для SPA-сайтов (Next.js)
 * 
 * Реализация согласно официальной документации Яндекс Метрики:
 * https://yandex.ru/support/metrica/code/install-counter-spa.html
 * 
 * Особенности:
 * 1. defer:true - отключает автоматическую отправку hit при загрузке
 * 2. Отправляет hit вручную при первой загрузке страницы
 * 3. Отправляет hit при каждом SPA-переходе между страницами
 * 4. Передает корректный referer для отслеживания переходов
 */
export function YandexMetrika() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrlRef = useRef<string>('');
  const isInitializedRef = useRef(false);
  const initialHitSentRef = useRef(false);

  // Логируем инициализацию компонента
  useEffect(() => {
    console.log('[Metrika] Component mounted');
    return () => {
      console.log('[Metrika] Component unmounted');
    };
  }, []);

  // Формируем полный URL страницы (путь + query параметры)
  const currentUrl = useMemo(() => {
    if (!pathname) return '/';
    const search = searchParams?.toString();
    return search ? `${pathname}?${search}` : pathname;
  }, [pathname, searchParams]);

  /**
   * Отправляет событие просмотра страницы в Яндекс Метрику
   * @param url - относительный URL страницы
   * @param isInitialHit - флаг первой загрузки страницы
   */
  const sendPageView = useCallback((url: string, isInitialHit = false) => {
    console.log('[Metrika] sendPageView called:', { url, isInitialHit, hostname: typeof window !== 'undefined' ? window.location.hostname : 'undefined' });
    
    // Проверки окружения
    if (typeof window === 'undefined') {
      console.log('[Metrika] Skipping - window is undefined');
      return;
    }
    
    // В разработке только логируем, но не отправляем
    const isProduction = window.location.hostname === PRODUCTION_HOSTNAME;
    const isDevelopment = !isProduction;
    
    console.log('[Metrika] Environment check:', { isProduction, isDevelopment, hostname: window.location.hostname, expectedHostname: PRODUCTION_HOSTNAME });
    
    if (isDevelopment) {
      console.log('[Metrika DEV] Page view:', url, { isInitialHit });
      previousUrlRef.current = url;
      return;
    }

    // Проверяем доступность счетчика
    if (!window.ym) {
      console.warn('[Metrika] Counter not ready yet');
      return;
    }

    try {
      // Формируем абсолютный URL для hit
      const absoluteUrl = `${window.location.origin}${url}`;
      
      // Формируем referer (предыдущая страница)
      const referer = previousUrlRef.current
        ? `${window.location.origin}${previousUrlRef.current}`
        : document.referrer || undefined;

      const options: any = {
        title: document.title,
      };

      // Referer передаем только для последующих переходов
      if (!isInitialHit && referer) {
        options.referer = referer;
      }

      // Отправляем hit
      window.ym(YM_ID, 'hit', absoluteUrl, options);
      
      console.log('[Metrika] Hit sent:', {
        url: absoluteUrl,
        title: document.title,
        referer: options.referer,
        isInitialHit
      });

      // Сохраняем текущий URL как предыдущий для следующего перехода
      previousUrlRef.current = url;
    } catch (error) {
      console.error('[Metrika] Error sending hit:', error);
    }
  }, []);

  /**
   * Ожидает готовности счетчика и отправляет первый hit
   */
  const waitForCounterAndSendInitialHit = useCallback(() => {
    let attempts = 0;
    const maxAttempts = 50; // 50 * 100ms = 5 секунд максимум
    
    const checkCounter = () => {
      attempts++;
      
      if (window.ym) {
        // Счетчик готов - отправляем первый hit
        console.log('[Metrika] Counter ready after', attempts * 100, 'ms');
        sendPageView(currentUrl, true);
        initialHitSentRef.current = true;
      } else if (attempts < maxAttempts) {
        // Продолжаем ждать
        setTimeout(checkCounter, 100);
      } else {
        console.error('[Metrika] Counter not initialized after 5 seconds');
      }
    };

    checkCounter();
  }, [currentUrl, sendPageView]);

  /**
   * Обработчик успешной загрузки скрипта Метрики
   */
  const handleScriptLoad = useCallback(() => {
    console.log('[Metrika] Script loaded');
    isInitializedRef.current = true;
    
    // Ждем готовности счетчика и отправляем первый hit
    waitForCounterAndSendInitialHit();
  }, [waitForCounterAndSendInitialHit]);

  /**
   * Обработчик ошибки загрузки скрипта
   */
  const handleScriptError = useCallback(() => {
    console.error('[Metrika] Script loading failed');
  }, []);

  /**
   * Запасной механизм инициализации - на случай если onLoad не сработал
   */
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isInitializedRef.current) {
        console.log('[Metrika] Fallback initialization after 3s');
        isInitializedRef.current = true;
        waitForCounterAndSendInitialHit();
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [waitForCounterAndSendInitialHit]);

  /**
   * Отслеживаем изменения URL для отправки hit при SPA-переходах
   */
  useEffect(() => {
    // Пропускаем первую загрузку - она обрабатывается в handleScriptLoad
    if (!initialHitSentRef.current) {
      return;
    }

    // Проверяем, что URL действительно изменился
    if (previousUrlRef.current === currentUrl) {
      return;
    }

    // Отправляем hit для нового URL
    console.log('[Metrika] URL changed:', previousUrlRef.current, '->', currentUrl);
    sendPageView(currentUrl, false);
  }, [currentUrl, sendPageView]);

  return (
    <>
      <Script
        id="yandex-metrika"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
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

