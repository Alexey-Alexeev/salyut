'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Компонент для обработки canonical URL в каталоге
// Работает на клиенте для фильтрованных страниц
export function CatalogCanonical() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Проверяем, есть ли активные фильтры
    const hasFilters = searchParams.get('category') || 
                      searchParams.get('search') || 
                      searchParams.get('minPrice') || 
                      searchParams.get('maxPrice') || 
                      searchParams.get('sortBy');

    // Если есть фильтры - устанавливаем canonical URL на основной каталог
    if (hasFilters) {
      const expectedCanonical = 'https://salutgrad.ru/catalog/';
      
      // Удаляем существующий canonical link если есть
      const existingCanonical = document.querySelector('link[rel="canonical"]');
      if (existingCanonical) {
        existingCanonical.remove();
      }

      // Добавляем новый canonical link
      const canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = expectedCanonical;
      document.head.appendChild(canonicalLink);
    }
  }, [searchParams]);

  return null; // Компонент не рендерит ничего видимого
}
