'use client';

import { useEffect } from 'react';

/**
 * Компонент для загрузки Яндекс.Метрики только на клиенте
 * Решает проблему с SSR, когда скрипт не выполняется на клиенте
 */
export function YandexMetrika() {
  useEffect(() => {
    // Загружаем Метрику только на клиенте
    if (typeof window === 'undefined') {
      return;
    }

    // Проверяем, не загружена ли уже Метрика
    const existingScript = document.querySelector('script[src*="mc.yandex.ru/metrika/tag.js"]');
    if (existingScript) {
      console.log('Metrika: script already exists');
      return;
    }

    // Создаём функцию ym, если её ещё нет
    (window as any).ym = (window as any).ym || function() {
      ((window as any).ym.a = (window as any).ym.a || []).push(arguments);
    };
    (window as any).ym.l = Number(new Date());

    // Создаём и добавляем скрипт
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = 'https://mc.yandex.ru/metrika/tag.js?id=104700931';
    
    script.onload = function() {
      console.log('Metrika: script loaded successfully');
      // Инициализируем Метрику после загрузки скрипта
      if (typeof (window as any).ym === 'function') {
        try {
          (window as any).ym(104700931, 'init', {
            ssr: true,
            webvisor: true,
            clickmap: true,
            ecommerce: "dataLayer",
            accurateTrackBounce: true,
            trackLinks: true
          });
          console.log('Metrika: initialized successfully');
        } catch (err) {
          console.error('Metrika: init error', err);
        }
      }
    };
    
    script.onerror = function() {
      console.error('Metrika: script load error');
    };

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
      console.log('Metrika: script tag created');
    } else {
      document.head.appendChild(script);
      console.log('Metrika: script tag appended to head');
    }
  }, []);

  return (
    <>
      {/* noscript пиксель для пользователей без JS */}
      <noscript>
        <div>
          <img
            src="https://mc.yandex.ru/watch/104700931"
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}

