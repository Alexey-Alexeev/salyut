'use client';

import { useEffect, useState } from 'react';

interface VersionInfo {
  version: string;
  timestamp: string;
  buildId: string;
}

export function CacheBuster() {
  const [lastCheck, setLastCheck] = useState<string | null>(null);
  
  // Настройка режима обновления
  const AUTO_UPDATE_MODE = true; // true = автоматически, false = с уведомлением

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch('/api/version', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (!response.ok) {
          throw new Error('Не удалось получить версию');
        }
        
        const versionInfo: VersionInfo = await response.json();
        const currentVersion = localStorage.getItem('site-version');
        const lastCheckTime = localStorage.getItem('last-version-check');
        
        setLastCheck(lastCheckTime);
        
        // Если версия изменилась
        if (currentVersion && currentVersion !== versionInfo.version) {
          
          // В локальной разработке не показываем уведомления об обновлениях
          const isLocalDev = versionInfo.version === 'local-dev' || window.location.hostname === 'localhost';
          
          if (!isLocalDev) {
            // Очищаем все кэши
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
              );
            }
            
            // Очищаем localStorage
            localStorage.removeItem('site-version');
            localStorage.removeItem('last-version-check');
            
            // Функция для безопасной перезагрузки с учетом загрузки Метрики
            const safeReload = () => {
              // Проверяем, не взаимодействует ли пользователь с сайтом
              const hasActiveDialogs = document.querySelector('[role="dialog"][aria-hidden="false"]') !== null;
              // Проверяем активные формы (совместимый способ без :has())
              const activeInputs = document.querySelectorAll('input:focus, textarea:focus, select:focus');
              const hasActiveForms = activeInputs.length > 0;
              
              // Если пользователь активно взаимодействует, откладываем перезагрузку
              if (hasActiveDialogs || hasActiveForms) {
                // Проверяем снова через 30 секунд
                setTimeout(() => {
                  const stillActiveDialogs = document.querySelector('[role="dialog"][aria-hidden="false"]') !== null;
                  const stillActiveInputs = document.querySelectorAll('input:focus, textarea:focus, select:focus');
                  const stillActiveForms = stillActiveInputs.length > 0;
                  
                  if (!stillActiveDialogs && !stillActiveForms) {
                    safeReload();
                  }
                }, 30000);
                return;
              }
              
              // Даём Метрике минимум 3 секунды на загрузку и инициализацию
              const minWaitTime = 3000; // минимум 3 секунды
              
              // Проверяем, загрузился ли скрипт Метрики
              const metrikaScript = document.querySelector('script[src*="mc.yandex.ru/metrika/tag.js"]');
              const metrikaLoaded = metrikaScript !== null;
              
              // Проверяем, инициализирована ли Метрика (проверяем наличие функции ym)
              const metrikaInitialized = typeof (window as any).ym === 'function';
              
              // Время с момента загрузки страницы
              const timeSinceLoad = performance.now();
              
              if (metrikaLoaded && metrikaInitialized && timeSinceLoad >= minWaitTime) {
                // Метрика загружена, инициализирована и прошло достаточно времени
                window.location.reload();
              } else if (timeSinceLoad < minWaitTime) {
                // Ждём, пока не пройдёт минимум времени
                const remainingTime = minWaitTime - timeSinceLoad;
                setTimeout(() => window.location.reload(), remainingTime);
              } else {
                // Прошло достаточно времени, но Метрика может не загрузиться
                // Даём ещё небольшую задержку на случай медленной сети
                setTimeout(() => window.location.reload(), 1000);
              }
            };
            
            // Настраиваемый режим обновления
            if (AUTO_UPDATE_MODE) {
              // АВТОМАТИЧЕСКОЕ обновление без уведомления
              // Обнаружена новая версия - автоматическое обновление с учётом Метрики
              safeReload();
            } else {
              // С уведомлением (пользователь выбирает)
              if (confirm('Доступна новая версия сайта! Обновить страницу?')) {
                safeReload();
              }
            }
          } else {
            // В локальной разработке просто обновляем версию без уведомлений
          }
        }
        
        // Сохраняем текущую версию
        localStorage.setItem('site-version', versionInfo.version);
        localStorage.setItem('last-version-check', new Date().toISOString());
        
      } catch (error) {
        console.warn('Не удалось проверить версию сайта:', error);
      }
    };

    // Задержка первой проверки, чтобы дать Метрике время загрузиться
    const initialDelay = setTimeout(() => {
      checkVersion();
    }, 2000); // 2 секунды задержки для первой проверки

    // Проверяем каждые 5 минут (после первой проверки)
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  // Компонент работает в фоне без UI
  return null;
}
