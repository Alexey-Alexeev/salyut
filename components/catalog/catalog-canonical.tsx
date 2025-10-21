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

    // Удаляем старый canonical-тег, если есть
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) existingCanonical.remove();

    // Определяем canonical в зависимости от состояния фильтров
    const canonicalUrl = hasFilters
      ? 'https://salutgrad.ru/catalog/' // при фильтрах — указываем на общий каталог
      : window.location.origin + window.location.pathname; // без фильтров — текущий URL

    // Создаём новый тег
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = canonicalUrl;

    document.head.appendChild(canonicalLink);
  }, [searchParams]);

  return null;
}
