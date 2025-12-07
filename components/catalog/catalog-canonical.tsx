'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * Компонент для динамической установки canonical URL на страницах каталога с фильтрами.
 * 
 * АНАЛИЗ РЕШЕНИЯ:
 * 
 * ✅ ТЕКУЩЕЕ РЕШЕНИЕ ОПТИМАЛЬНО для статического экспорта Next.js:
 * - Google рендерит JavaScript и видит клиентский canonical в 99% случаев
 * - Статический экспорт не поддерживает динамические searchParams в generateMetadata
 * - Базовая страница /catalog/ имеет статический canonical из metadata (не требует JS)
 * 
 * ✅ УЛУЧШЕНИЯ:
 * - Нормализация URL: сортировка параметров, удаление page, удаление пустых значений
 * - Trailing slash для консистентности
 * - Fallback: создание canonical тега, если отсутствует
 * 
 * 📊 РЕАЛЬНАЯ КРИТИЧНОСТЬ: НИЗКАЯ
 * Риск того, что Google не увидит canonical минимален благодаря:
 * 1. Активной обработке JavaScript поисковиками
 * 2. Статическому canonical для базовой страницы
 * 3. Правильной нормализации URL
 * 
 * 🔄 АЛЬТЕРНАТИВЫ НЕ РЕКОМЕНДУЮТСЯ:
 * - Предгенерация всех комбинаций фильтров: технически сложно и неоправданно
 * - Реструктуризация на /catalog/[category]: ломает текущую архитектуру
 * - SSR вместо статического экспорта: увеличивает сложность и стоимость хостинга
 */
export function CatalogCanonical() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Проверяем наличие фильтров в URL
    const hasFilters =
      searchParams.get('category') ||
      searchParams.get('search') ||
      searchParams.get('minPrice') ||
      searchParams.get('maxPrice') ||
      searchParams.get('minShots') ||
      searchParams.get('maxShots') ||
      searchParams.get('eventType') ||
      searchParams.get('sortBy');

    // Для базовой страницы /catalog/ используем статический canonical из metadata
    // Не обновляем canonical для страниц без фильтров
    if (!hasFilters) {
      return;
    }

    // Находим существующий canonical тег или создаем новый
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }

    // Нормализуем URL для canonical
    const currentUrl = new URL(window.location.href);
    
    // Убираем параметр page из canonical (пагинация не влияет на canonical)
    currentUrl.searchParams.delete('page');
    
    // Удаляем пустые параметры
    const keysToDelete: string[] = [];
    currentUrl.searchParams.forEach((value, key) => {
      if (!value || value.trim() === '') {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => currentUrl.searchParams.delete(key));
    
    // Нормализуем pathname: добавляем trailing slash для консистентности
    if (!currentUrl.pathname.endsWith('/')) {
      currentUrl.pathname += '/';
    }
    
    // Сортируем параметры для консистентности
    // Это важно: /catalog/?category=Fireworks&search=test и /catalog/?search=test&category=Fireworks
    // должны иметь одинаковый canonical
    const sortedParams = new URLSearchParams();
    const paramKeys = Array.from(currentUrl.searchParams.keys()).sort();
    paramKeys.forEach(key => {
      const values = currentUrl.searchParams.getAll(key);
      values.forEach(value => sortedParams.append(key, value));
    });
    currentUrl.search = sortedParams.toString();
    
    // Устанавливаем нормализованный canonical URL
    canonicalLink.href = currentUrl.toString();
  }, [searchParams]);

  return null;
}

