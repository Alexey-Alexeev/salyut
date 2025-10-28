'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function CatalogCanonical() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const hasFilters =
      searchParams.get('category') ||
      searchParams.get('search') ||
      searchParams.get('minPrice') ||
      searchParams.get('maxPrice') ||
      searchParams.get('sortBy');

    // Определяем canonical в зависимости от состояния фильтров
    const canonicalUrl = hasFilters
      ? 'https://salutgrad.ru/catalog/' // при фильтрах — указываем на общий каталог
      : window.location.origin + window.location.pathname; // без фильтров — текущий URL

    // Просто обновляем href существующего canonical тега или создаем новый
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (canonicalLink) {
      // Обновляем существующий
      canonicalLink.href = canonicalUrl;
    } else {
      // Создаем новый
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = canonicalUrl;
      document.head.appendChild(canonicalLink);
    }

    // Cleanup функция - только если мы создали новый тег
    return () => {
      if (canonicalLink && canonicalLink.parentNode && !document.querySelector('link[rel="canonical"]')) {
        try {
          canonicalLink.parentNode.removeChild(canonicalLink);
        } catch (error) {
          // Игнорируем ошибки удаления
        }
      }
    };
  }, [searchParams]);

  return null;
}

