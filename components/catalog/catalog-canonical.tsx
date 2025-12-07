'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Компонент для динамической установки canonical URL на страницах каталога с фильтрами.
 * 
 * ВАЖНО: Для статического экспорта Next.js canonical устанавливается клиентски через JS.
 * Это работает, но поисковые системы могут не увидеть canonical до выполнения JS.
 * 
 * Рекомендация: В будущем рассмотреть серверную генерацию canonical через generateMetadata,
 * но для статического экспорта это требует дополнительной настройки.
 */
export function CatalogCanonical() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasFilters =
      searchParams.get('category') ||
      searchParams.get('search') ||
      searchParams.get('minPrice') ||
      searchParams.get('maxPrice') ||
      searchParams.get('minShots') ||
      searchParams.get('maxShots') ||
      searchParams.get('eventType') ||
      searchParams.get('sortBy');

    // Обновляем canonical ТОЛЬКО если есть фильтры
    // Для базовой страницы /catalog/ используется статический canonical из metadata
    if (!hasFilters) {
      return;
    }

    // Находим существующий canonical тег (он уже есть в HTML из metadata)
    // Если его нет, создаем новый (fallback для надежности)
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonicalLink) {
      // Если по какой-то причине canonical отсутствует, создаём его
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }

    // При фильтрах: указываем текущий полный URL с параметрами
    // Это позволяет Google понимать, что это уникальная страница с фильтрами
    const currentUrl = new URL(window.location.href);
    // Убираем параметр page из canonical, так как пагинация не должна влиять на canonical
    currentUrl.searchParams.delete('page');
    
    // Нормализуем URL: добавляем trailing slash к pathname если его нет
    if (!currentUrl.pathname.endsWith('/')) {
      currentUrl.pathname += '/';
    }
    
    // Сортируем параметры для консистентности (избегаем дублей из-за разного порядка параметров)
    const sortedParams = new URLSearchParams();
    const paramKeys = Array.from(currentUrl.searchParams.keys()).sort();
    paramKeys.forEach(key => {
      const values = currentUrl.searchParams.getAll(key);
      values.forEach(value => sortedParams.append(key, value));
    });
    currentUrl.search = sortedParams.toString();
    
    const canonicalUrl = currentUrl.toString();
    canonicalLink.href = canonicalUrl;
  }, [searchParams]);

  return null;
}

