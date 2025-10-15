import { useState, useCallback, useRef } from 'react';

interface FilterState {
    categories: string[];
    priceFrom: string;
    priceTo: string;
    priceMin: number;
    priceMax: number;
    search: string;
}

interface UseCatalogFiltersProps {
    initialFilters?: Partial<FilterState>;
    onFiltersChange?: (filters: FilterState) => void;
}

export function useCatalogFilters({
    initialFilters = {},
    onFiltersChange,
}: UseCatalogFiltersProps = {}) {
    const [filters, setFilters] = useState<FilterState>({
        categories: [],
        priceFrom: '',
        priceTo: '',
        priceMin: 0,
        priceMax: 10000,
        search: '',
        ...initialFilters,
    });

    const [searchValue, setSearchValue] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const updateFilters = useCallback((updates: Partial<FilterState>) => {
        setFilters(prev => {
            const newFilters = { ...prev, ...updates };
            onFiltersChange?.(newFilters);
            return newFilters;
        });
    }, [onFiltersChange]);

    const handleCategoryChange = useCallback(
        (categorySlug: string, checked: boolean) => {
            updateFilters({
                categories: checked
                    ? [...filters.categories, categorySlug]
                    : filters.categories.filter(slug => slug !== categorySlug),
            });
        },
        [filters.categories, updateFilters]
    );

    const handlePriceChange = useCallback(
        (from: string, to: string) => {
            updateFilters({
                priceFrom: from,
                priceTo: to,
            });
        },
        [updateFilters]
    );

    const handleRemoveCategory = useCallback(
        (categorySlug: string) => {
            updateFilters({
                categories: filters.categories.filter(slug => slug !== categorySlug),
            });
        },
        [filters.categories, updateFilters]
    );

    const handleClearPrice = useCallback(() => {
        updateFilters({
            priceFrom: '',
            priceTo: '',
        });
    }, [updateFilters]);

    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchValue(value);

            // Очищаем предыдущий таймаут
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }

            // Устанавливаем новый таймаут для debouncing
            searchTimeoutRef.current = setTimeout(() => {
                updateFilters({ search: value });
            }, 500);
        },
        [updateFilters]
    );

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        updateFilters({ search: '' });

        // Очищаем таймаут
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    }, [updateFilters]);

    const handleClearAllFilters = useCallback(() => {
        setSearchValue('');
        updateFilters({
            categories: [],
            priceFrom: '',
            priceTo: '',
            search: '',
        });

        // Очищаем таймаут
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    }, [updateFilters]);

    // Очистка таймаута при размонтировании
    const cleanup = useCallback(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    }, []);

    return {
        filters,
        searchValue,
        setSearchValue,
        updateFilters,
        handleCategoryChange,
        handlePriceChange,
        handleRemoveCategory,
        handleClearPrice,
        handleSearchChange,
        handleClearSearch,
        handleClearAllFilters,
        cleanup,
    };
}
