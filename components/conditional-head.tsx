'use client';

import { useEffect, useState } from 'react';


// Компонент для условного canonical URL
export function ConditionalCanonical({ href }: { href: string }) {
  const [isProduction, setIsProduction] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isProd = hostname === 'salutgrad.ru';
    
    setIsProduction(isProd);
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return null;
  }

  // Для Vercel домена - указываем canonical на основной домен с правильным путем
  // Для production домена - указываем на себя
  const canonicalUrl = isProduction ? href : `https://salutgrad.ru${window.location.pathname}`;
  
  return <link rel="canonical" href={canonicalUrl} />;
}


// Компонент для условных мета-тегов noindex
export function ConditionalNoIndex() {
  const [isProduction, setIsProduction] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isProd = hostname === 'salutgrad.ru';
    
    setIsProduction(isProd);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || isProduction) {
      return;
    }

    // Создаем мета-теги программно
    const robotsMeta = document.createElement('meta');
    robotsMeta.name = 'robots';
    robotsMeta.content = 'noindex, nofollow';

    const googlebotMeta = document.createElement('meta');
    googlebotMeta.name = 'googlebot';
    googlebotMeta.content = 'noindex, nofollow';

    // Добавляем в head
    document.head.appendChild(robotsMeta);
    document.head.appendChild(googlebotMeta);

    // Cleanup функция
    return () => {
      try {
        if (robotsMeta.parentNode) {
          robotsMeta.parentNode.removeChild(robotsMeta);
        }
        if (googlebotMeta.parentNode) {
          googlebotMeta.parentNode.removeChild(googlebotMeta);
        }
      } catch (error) {
        // Игнорируем ошибки удаления
      }
    };
  }, [isLoaded, isProduction]);

  return null; // Не рендерим ничего в JSX
}
