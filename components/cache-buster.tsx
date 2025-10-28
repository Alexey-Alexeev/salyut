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
          console.log('Обнаружена новая версия сайта:', versionInfo.version);
          
          // В локальной разработке не показываем уведомления об обновлениях
          const isLocalDev = versionInfo.version === 'local-dev' || window.location.hostname === 'localhost';
          
          if (!isLocalDev) {
            // Очищаем все кэши
            if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
              );
              console.log('Кэши очищены');
            }
            
            // Очищаем localStorage
            localStorage.removeItem('site-version');
            localStorage.removeItem('last-version-check');
            
            // Настраиваемый режим обновления
            if (AUTO_UPDATE_MODE) {
              // АВТОМАТИЧЕСКОЕ обновление без уведомления
              console.log('Обнаружена новая версия - автоматическое обновление');
              window.location.reload();
            } else {
              // С уведомлением (пользователь выбирает)
              if (confirm('Доступна новая версия сайта! Обновить страницу?')) {
                window.location.reload();
              }
            }
          } else {
            // В локальной разработке просто обновляем версию без уведомлений
            console.log('Локальная разработка - обновляем версию без уведомлений');
          }
        }
        
        // Сохраняем текущую версию
        localStorage.setItem('site-version', versionInfo.version);
        localStorage.setItem('last-version-check', new Date().toISOString());
        
      } catch (error) {
        console.warn('Не удалось проверить версию сайта:', error);
      }
    };

    // Проверяем версию при загрузке
    checkVersion();
    
    // Проверяем каждые 5 минут
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Компонент работает в фоне без UI
  return null;
}
