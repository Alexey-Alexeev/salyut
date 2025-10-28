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

    // Безопасно удаляем старый canonical-тег, если есть
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical && existingCanonical.parentNode) {
      existingCanonical.parentNode.removeChild(existingCanonical);
    }

    // Определяем canonical в зависимости от состояния фильтров
    const canonicalUrl = hasFilters
      ? 'https://salutgrad.ru/catalog/' // при фильтрах — указываем на общий каталог
      : window.location.origin + window.location.pathname; // без фильтров — текущий URL

    // Создаём новый тег
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonicalUrl;

    // Безопасно добавляем в head
    if (document.head) {
      document.head.appendChild(canonicalLink);
    }
  }, [searchParams]);

  return null;
}
