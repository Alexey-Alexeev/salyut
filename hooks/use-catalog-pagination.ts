import { useCallback } from 'react';
import { FilterState } from './use-catalog-filters';
import { Pagination } from '@/types/catalog';

interface UseCatalogPaginationProps {
    filters: FilterState;
    sortBy: string;
    pagination: Pagination;
    setPagination: (updater: (prev: Pagination) => Pagination) => void;
    updateURL: (
        newFilters: Partial<FilterState>,
        newSortBy?: string,
        newPage?: number,
        addToHistory?: boolean
    ) => void;
    clearScrollPosition: () => void;
    setIsPaginationLoading: (value: boolean) => void;
}

/**
 * Хук для управления пагинацией каталога
 * Обрабатывает смену страницы с обновлением URL, прокруткой и показом загрузчика
 */
export function useCatalogPagination({
    filters,
    sortBy,
    pagination,
    setPagination,
    updateURL,
    clearScrollPosition,
    setIsPaginationLoading,
}: UseCatalogPaginationProps) {
    const handlePageChange = useCallback(
        (page: number) => {
            // Очищаем сохраненную позицию прокрутки при смене страницы через пагинацию
            clearScrollPosition();

            setPagination(prev => ({
                ...prev,
                page,
            }));

            // Обновляем URL с параметром page и создаем запись в истории браузера
            updateURL(filters, sortBy, page, true);

            // Показываем loader в мобильной версии вместо скролла
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
                setIsPaginationLoading(true);
            }

            // Плавный скролл наверх при смене страницы
            if (typeof window !== 'undefined') {
                // Используем небольшую задержку, чтобы убедиться, что скролл выполнится после обновления страницы
                setTimeout(() => {
                    try {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    } catch {
                        window.scrollTo(0, 0);
                    }
                }, 50);
            }
        },
        [filters, sortBy, updateURL, clearScrollPosition, setPagination, setIsPaginationLoading]
    );

    return {
        handlePageChange,
    };
}
