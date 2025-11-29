import { useState, useCallback } from 'react';

interface UseCatalogUIProps {
    initialViewMode?: 'grid' | 'list';
}

/**
 * Хук для управления UI состоянием каталога
 * Управляет режимом отображения, состоянием мобильных фильтров и другими UI состояниями
 */
export function useCatalogUI({ initialViewMode = 'grid' }: UseCatalogUIProps = {}) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const toggleMobileFilters = useCallback(() => {
        setIsMobileFiltersOpen(prev => !prev);
    }, []);

    const closeMobileFilters = useCallback(() => {
        setIsMobileFiltersOpen(false);
    }, []);

    return {
        viewMode,
        setViewMode,
        isMobileFiltersOpen,
        setIsMobileFiltersOpen,
        toggleMobileFilters,
        closeMobileFilters,
        isPaginationLoading,
        setIsPaginationLoading,
        isSearching,
        setIsSearching,
    };
}

