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


/**
 * Компонент для условных мета-тегов noindex (FALLBACK)
 * 
 * УЛУЧШЕННАЯ РЕАЛИЗАЦИЯ:
 * - Проверяет, не установлены ли уже мета-теги (избегает дублирования)
 * - Работает как fallback на случай, если синхронный inline script не сработает
 * - Основная защита: синхронный inline script в layout.tsx
 * 
 * АНАЛИЗ:
 * Текущее решение (useEffect) недостаточно надежно, так как выполняется асинхронно
 * после React hydration. Поисковики могут проиндексировать страницу до выполнения JS.
 * 
 * РЕКОМЕНДАЦИЯ:
 * Основная защита через синхронный inline script в <head> (layout.tsx).
 * Этот компонент остается как fallback для дополнительной надежности.
 */
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

    // Проверяем, не установлены ли уже мета-теги (избегаем дублирования)
    const existingRobotsMeta = document.querySelector('meta[name="robots"][content*="noindex"]');
    const existingGooglebotMeta = document.querySelector('meta[name="googlebot"][content*="noindex"]');

    // Создаем мета-теги только если их еще нет
    if (!existingRobotsMeta) {
      const robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      robotsMeta.content = 'noindex, nofollow';
      document.head.appendChild(robotsMeta);
    }

    if (!existingGooglebotMeta) {
      const googlebotMeta = document.createElement('meta');
      googlebotMeta.name = 'googlebot';
      googlebotMeta.content = 'noindex, nofollow';
      document.head.appendChild(googlebotMeta);
    }
  }, [isLoaded, isProduction]);

  return null; // Не рендерим ничего в JSX
}
