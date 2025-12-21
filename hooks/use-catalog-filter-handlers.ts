import { useCallback, useRef, useEffect } from 'react';
import { FilterState } from './use-catalog-filters';

interface UseCatalogFilterHandlersProps {
    filters: FilterState;
    sortBy: string;
    resetPage: () => void;
    updateURL: (
        newFilters: Partial<FilterState>,
        newSortBy?: string,
        newPage?: number,
        addToHistory?: boolean
    ) => void;
    // Методы для обновления фильтров
    addCategory: (category: string) => void;
    removeCategory: (category: string) => void;
    setPrice: (from: string, to: string) => void;
    clearPrice: () => void;
    setShots: (from: string, to: string) => void;
    clearShots: () => void;
    setSearch: (search: string) => void;
    clearSearch: () => void;
    setEventType: (eventType: 'wedding' | 'birthday' | 'new_year' | null) => void;
    clearEventType: () => void;
    setPriceFrom: (value: string) => void;
    setPriceTo: (value: string) => void;
    setShotsFrom: (value: string) => void;
    setShotsTo: (value: string) => void;
    clearAll: () => void;
    setSortBy: (sortBy: string) => void;
    setPagination: (updater: (prev: any) => any) => void;
    // Callbacks для обновления значений полей ввода
    setSearchValue: (value: string) => void;
    setPriceFromValue: (value: string) => void;
    setPriceToValue: (value: string) => void;
    setShotsFromValue: (value: string) => void;
    setShotsToValue: (value: string) => void;
    setIsSearching: (value: boolean) => void;
}

/**
 * Хук для управления обработчиками фильтров каталога
 * Упрощает логику обработки изменений фильтров, debounce и обновления URL
 */
export function useCatalogFilterHandlers({
    filters,
    sortBy,
    resetPage,
    updateURL,
    addCategory,
    removeCategory,
    setPrice,
    clearPrice,
    setShots,
    clearShots,
    setSearch,
    clearSearch,
    setEventType,
    clearEventType,
    setPriceFrom,
    setPriceTo,
    setShotsFrom,
    setShotsTo,
    clearAll,
    setSortBy,
    setPagination,
    setSearchValue,
    setPriceFromValue,
    setPriceToValue,
    setShotsFromValue,
    setShotsToValue,
    setIsSearching,
}: UseCatalogFilterHandlersProps) {
    // Ref для хранения актуальных фильтров (для использования в обработчиках с debounce)
    const filtersRef = useRef(filters);
    
    // Обновляем ref при изменении фильтров
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // Refs для debounce таймаутов
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const priceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shotsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Очистка всех таймаутов
    const clearAllTimeouts = useCallback(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
        }
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
            priceTimeoutRef.current = null;
        }
        if (shotsTimeoutRef.current) {
            clearTimeout(shotsTimeoutRef.current);
            shotsTimeoutRef.current = null;
        }
    }, []);

    // Обработчик изменения категории
    const handleCategoryChange = useCallback(
        (categorySlug: string, checked: boolean) => {
            resetPage();
            if (checked) {
                addCategory(categorySlug);
            } else {
                removeCategory(categorySlug);
            }
            const newCategories = checked
                ? [...filters.categories, categorySlug]
                : filters.categories.filter(slug => slug !== categorySlug);
            updateURL({ ...filters, categories: newCategories }, sortBy);
        },
        [resetPage, filters, sortBy, updateURL, addCategory, removeCategory]
    );

    // Обработчик удаления категории
    const handleRemoveCategory = useCallback(
        (categorySlug: string) => {
            resetPage();
            removeCategory(categorySlug);
            const newCategories = filters.categories.filter(slug => slug !== categorySlug);
            updateURL({ ...filters, categories: newCategories }, sortBy);
        },
        [resetPage, filters, sortBy, updateURL, removeCategory]
    );

    // Обработчик изменения цены (диапазон)
    const handlePriceChange = useCallback(
        (from: string, to: string) => {
            resetPage();
            setPrice(from, to);
            updateURL({ ...filters, priceFrom: from, priceTo: to }, sortBy);
        },
        [resetPage, filters, sortBy, updateURL, setPrice]
    );

    // Обработчик очистки цены
    const handleClearPrice = useCallback(() => {
        resetPage();
        clearPrice();
        updateURL({ ...filters, priceFrom: '', priceTo: '' }, sortBy);
    }, [resetPage, filters, sortBy, updateURL, clearPrice]);

    // Обработчик изменения залпов (диапазон)
    const handleShotsChange = useCallback(
        (from: string, to: string) => {
            resetPage();
            setShots(from, to);
            updateURL({ ...filters, shotsFrom: from, shotsTo: to }, sortBy);
        },
        [resetPage, filters, sortBy, updateURL, setShots]
    );

    // Обработчик очистки залпов
    const handleClearShots = useCallback(() => {
        setShotsFromValue('');
        setShotsToValue('');
        resetPage();
        clearShots();
        updateURL({ ...filters, shotsFrom: '', shotsTo: '' }, sortBy);
        if (shotsTimeoutRef.current) {
            clearTimeout(shotsTimeoutRef.current);
            shotsTimeoutRef.current = null;
        }
    }, [resetPage, filters, sortBy, updateURL, clearShots, setShotsFromValue, setShotsToValue]);

    // Обработчик изменения типа события
    const handleEventTypeChange = useCallback(
        (eventType: 'wedding' | 'birthday' | 'new_year' | null) => {
            resetPage();
            setEventType(eventType);
            updateURL({ ...filters, eventType }, sortBy);
        },
        [resetPage, filters, sortBy, updateURL, setEventType]
    );

    // Обработчик очистки типа события
    const handleClearEventType = useCallback(() => {
        resetPage();
        clearEventType();
        updateURL({ ...filters, eventType: null }, sortBy);
    }, [resetPage, filters, sortBy, updateURL, clearEventType]);

    // Обработчик изменения сортировки
    const handleSortChange = useCallback(
        (newSortBy: string) => {
            setSortBy(newSortBy);
            setPagination(prev => ({ ...prev, page: 1 }));
            updateURL(filters, newSortBy, 1);
        },
        [filters, updateURL, setSortBy, setPagination]
    );

    // Обработчик изменения поиска (с debounce)
    const handleSearchChange = useCallback(
        (value: string) => {
            setSearchValue(value);

            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
                searchTimeoutRef.current = null;
            }

            if (value.trim() === '') {
                setIsSearching(false);
                resetPage();
                clearSearch();
                // Важно: обновляем URL сразу, чтобы удалить параметр search из URL
                updateURL({ ...filtersRef.current, search: '', eventType: null }, sortBy);
                return;
            }

            setIsSearching(true);

            searchTimeoutRef.current = setTimeout(() => {
                resetPage();
                setSearch(value);
                updateURL({ ...filtersRef.current, search: value, eventType: null }, sortBy);
                setIsSearching(false);
            }, 300);
        },
        [resetPage, sortBy, updateURL, setSearch, clearSearch, setSearchValue, setIsSearching, filtersRef]
    );

    // Обработчик очистки поиска
    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        setIsSearching(false);
        resetPage();
        clearSearch();
        updateURL({ ...filters, search: '' }, sortBy);
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = null;
        }
    }, [resetPage, filters, sortBy, updateURL, clearSearch, setSearchValue, setIsSearching]);

    // Обработчик изменения цены "от" (с debounce)
    const handlePriceFromChange = useCallback(
        (value: string) => {
            setPriceFromValue(value);

            if (priceTimeoutRef.current) {
                clearTimeout(priceTimeoutRef.current);
            }

            if (value.trim() === '') {
                resetPage();
                setPriceFrom('');
                updateURL({ ...filters, priceFrom: '' }, sortBy);
                return;
            }

            priceTimeoutRef.current = setTimeout(() => {
                resetPage();
                setPriceFrom(value);
                updateURL({ ...filtersRef.current, priceFrom: value }, sortBy);
            }, 500);
        },
        [resetPage, sortBy, updateURL, setPriceFrom, setPriceFromValue, filtersRef]
    );

    // Обработчик изменения цены "до" (с debounce)
    const handlePriceToChange = useCallback(
        (value: string) => {
            setPriceToValue(value);

            if (priceTimeoutRef.current) {
                clearTimeout(priceTimeoutRef.current);
            }

            if (value.trim() === '') {
                resetPage();
                setPriceTo('');
                updateURL({ ...filters, priceTo: '' }, sortBy);
                return;
            }

            priceTimeoutRef.current = setTimeout(() => {
                resetPage();
                setPriceTo(value);
                updateURL({ ...filtersRef.current, priceTo: value }, sortBy);
            }, 500);
        },
        [resetPage, sortBy, updateURL, setPriceTo, setPriceToValue, filtersRef]
    );

    // Обработчик изменения залпов "от" (с debounce)
    const handleShotsFromChange = useCallback(
        (value: string) => {
            setShotsFromValue(value);

            if (shotsTimeoutRef.current) {
                clearTimeout(shotsTimeoutRef.current);
            }

            if (value.trim() === '') {
                resetPage();
                setShotsFrom('');
                updateURL({ ...filters, shotsFrom: '' }, sortBy);
                return;
            }

            shotsTimeoutRef.current = setTimeout(() => {
                resetPage();
                setShotsFrom(value);
                updateURL({ ...filtersRef.current, shotsFrom: value }, sortBy);
            }, 500);
        },
        [resetPage, sortBy, updateURL, setShotsFrom, setShotsFromValue, filtersRef]
    );

    // Обработчик изменения залпов "до" (с debounce)
    const handleShotsToChange = useCallback(
        (value: string) => {
            setShotsToValue(value);

            if (shotsTimeoutRef.current) {
                clearTimeout(shotsTimeoutRef.current);
            }

            if (value.trim() === '') {
                resetPage();
                setShotsTo('');
                updateURL({ ...filters, shotsTo: '' }, sortBy);
                return;
            }

            shotsTimeoutRef.current = setTimeout(() => {
                resetPage();
                setShotsTo(value);
                updateURL({ ...filtersRef.current, shotsTo: value }, sortBy);
            }, 500);
        },
        [resetPage, sortBy, updateURL, setShotsTo, setShotsToValue, filtersRef]
    );

    // Обработчик очистки всех фильтров
    const handleClearAllFilters = useCallback(() => {
        setSearchValue('');
        setPriceFromValue('');
        setPriceToValue('');
        setShotsFromValue('');
        setShotsToValue('');
        setIsSearching(false);
        resetPage();
        setSortBy('popular');
        clearAll();
        const clearedFilters: Partial<FilterState> = {
            categories: [],
            priceFrom: '',
            priceTo: '',
            shotsFrom: '',
            shotsTo: '',
            search: '',
            eventType: null,
        };
        updateURL(clearedFilters, 'popular');
        clearAllTimeouts();
    }, [
        resetPage,
        updateURL,
        clearAll,
        setSortBy,
        setSearchValue,
        setPriceFromValue,
        setPriceToValue,
        setShotsFromValue,
        setShotsToValue,
        setIsSearching,
        clearAllTimeouts,
    ]);

    return {
        handleCategoryChange,
        handleRemoveCategory,
        handlePriceChange,
        handleClearPrice,
        handleShotsChange,
        handleClearShots,
        handleEventTypeChange,
        handleClearEventType,
        handleSortChange,
        handleSearchChange,
        handleClearSearch,
        handlePriceFromChange,
        handlePriceToChange,
        handleShotsFromChange,
        handleShotsToChange,
        handleClearAllFilters,
        clearAllTimeouts,
    };
}

