import { useEffect, useRef, useCallback } from 'react';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterState } from './use-catalog-filters';

interface UseCatalogUrlSyncProps {
    filters: FilterState;
    sortBy: string;
    currentPage: number;
    searchParams: { [key: string]: string | string[] | undefined };
    onFiltersChange: React.Dispatch<React.SetStateAction<FilterState>>;
    onSortByChange: (sortBy: string) => void;
    onPageChange: (page: number) => void;
    onSearchValueChange: (value: string) => void;
    onPriceFromValueChange: (value: string) => void;
    onPriceToValueChange: (value: string) => void;
    onShotsFromValueChange: (value: string) => void;
    onShotsToValueChange: (value: string) => void;
    onInitializingChange: (isInitializing: boolean) => void;
    onLastPageRefUpdate?: (page: number) => void;
}

/**
 * Хук для синхронизации фильтров каталога с URL параметрами
 * Обеспечивает двустороннюю синхронизацию: URL -> фильтры и фильтры -> URL
 */
export function useCatalogUrlSync({
    filters,
    sortBy,
    currentPage,
    searchParams,
    onFiltersChange,
    onSortByChange,
    onPageChange,
    onSearchValueChange,
    onPriceFromValueChange,
    onPriceToValueChange,
    onShotsFromValueChange,
    onShotsToValueChange,
    onInitializingChange,
    onLastPageRefUpdate,
}: UseCatalogUrlSyncProps) {
    const router = useRouter();
    const urlSearchParams = useSearchParams();

    // Ref для отслеживания, была ли выполнена инициализация
    const hasInitializedRef = useRef(false);
    
    // Ref для отслеживания, идет ли инициализация из URL
    const isInitializingFromUrlRef = useRef(false);
    
    // Ref для отслеживания, обновляется ли URL программно
    const isUpdatingURLRef = useRef(false);
    
    // Ref для таймаута инициализации
    const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Функция для обновления URL с фильтрами
    const updateURL = useCallback((
        newFilters: Partial<FilterState>,
        newSortBy?: string,
        newPage?: number,
        addToHistory: boolean = false
    ) => {
        // Используем текущий URL для получения параметров
        const currentUrl = typeof window !== 'undefined' ? window.location.search : '';
        const params = new URLSearchParams(currentUrl);

        // Очищаем существующие параметры фильтров
        params.delete('search');
        params.delete('category');
        params.delete('minPrice');
        params.delete('maxPrice');
        params.delete('minShots');
        params.delete('maxShots');
        params.delete('eventType');
        params.delete('sortBy');
        params.delete('page');

        // Добавляем новые параметры только если они не пустые
        if (newFilters.search?.trim()) {
            params.set('search', newFilters.search.trim());
        }

        if (newFilters.categories && newFilters.categories.length > 0) {
            newFilters.categories.forEach((category: string) => {
                params.append('category', category);
            });
        }

        if (newFilters.priceFrom?.trim()) {
            params.set('minPrice', newFilters.priceFrom.trim());
        }

        if (newFilters.priceTo?.trim()) {
            params.set('maxPrice', newFilters.priceTo.trim());
        }

        if (newFilters.shotsFrom?.trim()) {
            params.set('minShots', newFilters.shotsFrom.trim());
        }

        if (newFilters.shotsTo?.trim()) {
            params.set('maxShots', newFilters.shotsTo.trim());
        }

        if (newFilters.eventType) {
            params.set('eventType', newFilters.eventType);
        }

        if (newSortBy && newSortBy !== 'popular') {
            params.set('sortBy', newSortBy);
        }

        if (newPage && newPage > 1) {
            params.set('page', newPage.toString());
        }

        // Обновляем URL без перезагрузки страницы
        const newURL = params.toString() ? `?${params.toString()}` : '';
        const fullURL = `/catalog${newURL}`;
        
        isUpdatingURLRef.current = true;
        
        // Используем push для создания записи в истории при смене страницы, replace для фильтров
        if (addToHistory) {
            router.push(fullURL, { scroll: false });
        } else {
            router.replace(fullURL, { scroll: false });
        }
        
        // Сбрасываем флаг после небольшой задержки, чтобы useEffect мог его увидеть
        setTimeout(() => {
            isUpdatingURLRef.current = false;
        }, 100);
    }, [router]);

    // Инициализация фильтров из URL (только один раз)
    useEffect(() => {
        if (hasInitializedRef.current) return;

        // Парсим URL параметры вручную для статического экспорта
        let categoryParam: string | string[] | undefined;
        let searchParam: string | undefined;
        let minPriceParam: string | undefined;
        let maxPriceParam: string | undefined;
        let minShotsParam: string | undefined;
        let maxShotsParam: string | undefined;
        let sortByParam: string | undefined;
        let pageParam: number = 1;

        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            categoryParam = urlParams.getAll('category');
            searchParam = urlParams.get('search') || undefined;
            minPriceParam = urlParams.get('minPrice') || undefined;
            maxPriceParam = urlParams.get('maxPrice') || undefined;
            minShotsParam = urlParams.get('minShots') || undefined;
            maxShotsParam = urlParams.get('maxShots') || undefined;
            const eventTypeParam = urlParams.get('eventType') as 'wedding' | 'birthday' | 'new_year' | undefined;
            sortByParam = urlParams.get('sortBy') || undefined;
            const pageStr = urlParams.get('page');
            pageParam = pageStr ? parseInt(pageStr, 10) : 1;
        } else {
            // Fallback для SSR
            categoryParam = searchParams.category as string | string[];
            searchParam = searchParams.search as string;
            minPriceParam = searchParams.minPrice as string;
            maxPriceParam = searchParams.maxPrice as string;
            minShotsParam = searchParams.minShots as string;
            maxShotsParam = searchParams.maxShots as string;
            const eventTypeParam = searchParams.eventType as 'wedding' | 'birthday' | 'new_year' | undefined;
            sortByParam = searchParams.sortBy as string;
            const pageStr = searchParams.page as string;
            pageParam = pageStr ? parseInt(pageStr, 10) : 1;
        }

        // Парсим категории (может быть массив)
        const categoriesFromUrl = Array.isArray(categoryParam) ? categoryParam : (categoryParam ? [categoryParam] : []);

        // Проверяем, есть ли параметры в URL (включая page)
        const eventTypeParam = typeof window !== 'undefined' 
            ? (new URLSearchParams(window.location.search).get('eventType') as 'wedding' | 'birthday' | 'new_year' | null)
            : (searchParams.eventType as 'wedding' | 'birthday' | 'new_year' | undefined);
        const hasUrlParams = (categoryParam && categoryParam.length > 0) || 
            searchParam || 
            minPriceParam || 
            maxPriceParam || 
            minShotsParam || 
            maxShotsParam || 
            eventTypeParam || 
            sortByParam || 
            (pageParam > 1);

        // Устанавливаем страницу независимо от других параметров
        if (!isNaN(pageParam) && pageParam > 0) {
            onPageChange(pageParam);
            if (onLastPageRefUpdate) {
                onLastPageRefUpdate(pageParam);
            }
        }

        if (hasUrlParams) {
            // Устанавливаем флаг инициализации из URL
            isInitializingFromUrlRef.current = true;

            // Очищаем предыдущий таймаут
            if (initializationTimeoutRef.current) {
                clearTimeout(initializationTimeoutRef.current);
            }

            // Устанавливаем флаг инициализации с задержкой
            initializationTimeoutRef.current = setTimeout(() => {
                onInitializingChange(true);
            }, 100);

            onFiltersChange(prev => ({
                ...prev,
                categories: categoriesFromUrl,
                search: searchParam || '',
                priceFrom: minPriceParam || '',
                priceTo: maxPriceParam || '',
                shotsFrom: minShotsParam || '',
                shotsTo: maxShotsParam || '',
                eventType: eventTypeParam || null,
            }));

            if (sortByParam) {
                onSortByChange(sortByParam);
            }

            // Синхронизируем значения полей
            if (searchParam) {
                onSearchValueChange(searchParam);
            }
            if (minPriceParam) {
                onPriceFromValueChange(minPriceParam);
            }
            if (maxPriceParam) {
                onPriceToValueChange(maxPriceParam);
            }
            if (minShotsParam) {
                onShotsFromValueChange(minShotsParam);
            }
            if (maxShotsParam) {
                onShotsToValueChange(maxShotsParam);
            }
        } else {
            // Если нет параметров URL, сразу завершаем инициализацию
            onInitializingChange(false);
        }

        hasInitializedRef.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]); // Колбэки стабильны (setState функции), не нужно включать в зависимости

    // Отслеживание изменений URL после инициализации для синхронизации фильтров
    useEffect(() => {
        // Пропускаем во время первичной инициализации
        if (!hasInitializedRef.current) return;
        // Пропускаем во время инициализации из URL
        if (isInitializingFromUrlRef.current) return;
        // Пропускаем, если URL был обновлен программно (через updateURL)
        if (isUpdatingURLRef.current) {
            return;
        }

        // Парсим текущие URL параметры
        const categoryParam = urlSearchParams.getAll('category');
        const searchParam = urlSearchParams.get('search');
        const minPriceParam = urlSearchParams.get('minPrice');
        const maxPriceParam = urlSearchParams.get('maxPrice');
        const minShotsParam = urlSearchParams.get('minShots');
        const maxShotsParam = urlSearchParams.get('maxShots');
        const eventTypeParam = urlSearchParams.get('eventType') as 'wedding' | 'birthday' | 'new_year' | null;
        const sortByParam = urlSearchParams.get('sortBy');
        const pageParam = urlSearchParams.get('page');

        // Парсим категории (может быть массив)
        const categoriesFromUrl = Array.isArray(categoryParam) 
            ? categoryParam 
            : (categoryParam ? [categoryParam] : []);

        // Проверяем, есть ли параметры фильтров в URL (sortBy не считается фильтром)
        const hasUrlParams = (categoriesFromUrl.length > 0) || 
                            searchParam || 
                            minPriceParam || 
                            maxPriceParam ||
                            minShotsParam ||
                            maxShotsParam ||
                            eventTypeParam;

        // Синхронизируем фильтры с URL
        // Проверяем, нужно ли обновлять фильтры
        const categoriesChanged = JSON.stringify([...filters.categories].sort()) !== JSON.stringify([...categoriesFromUrl].sort());
        const searchChanged = (filters.search || '') !== (searchParam || '');
        const priceFromChanged = (filters.priceFrom || '') !== (minPriceParam || '');
        const priceToChanged = (filters.priceTo || '') !== (maxPriceParam || '');
        const shotsFromChanged = (filters.shotsFrom || '') !== (minShotsParam || '');
        const shotsToChanged = (filters.shotsTo || '') !== (maxShotsParam || '');
        const eventTypeChanged = (filters.eventType || null) !== (eventTypeParam || null);

        if (!hasUrlParams) {
            // Если URL параметров фильтров нет, сбрасываем фильтры
            if (filters.categories.length === 0 && 
                !filters.search.trim() && 
                !filters.priceFrom && 
                !filters.priceTo &&
                !filters.shotsFrom &&
                !filters.shotsTo &&
                !filters.eventType) {
                // Фильтры уже сброшены, ничего не делаем
            } else {
                onFiltersChange(prev => ({
                    ...prev,
                    categories: [],
                    search: '',
                    priceFrom: '',
                    priceTo: '',
                    shotsFrom: '',
                    shotsTo: '',
                    eventType: null,
                }));
            }
        } else {
            // Если есть параметры в URL, но фильтры не изменились, не обновляем
            if (categoriesChanged || searchChanged || priceFromChanged || priceToChanged || shotsFromChanged || shotsToChanged || eventTypeChanged) {
                // Восстанавливаем фильтры из URL
                onFiltersChange(prev => ({
                    ...prev,
                    categories: categoriesFromUrl,
                    search: searchParam || '',
                    priceFrom: minPriceParam || '',
                    priceTo: maxPriceParam || '',
                    shotsFrom: minShotsParam || '',
                    shotsTo: maxShotsParam || '',
                    eventType: eventTypeParam || null,
                }));
            }
        }

        // Синхронизируем значения полей с URL параметрами
        if (hasUrlParams) {
            onSearchValueChange(searchParam || '');
            onPriceFromValueChange(minPriceParam || '');
            onPriceToValueChange(maxPriceParam || '');
            onShotsFromValueChange(minShotsParam || '');
            onShotsToValueChange(maxShotsParam || '');
        } else {
            onSearchValueChange('');
            onPriceFromValueChange('');
            onPriceToValueChange('');
            onShotsFromValueChange('');
            onShotsToValueChange('');
        }
        
        // Синхронизируем сортировку
        if (sortByParam) {
            onSortByChange(sortByParam);
        } else {
            if (sortBy !== 'popular') {
                onSortByChange('popular');
            }
        }

        // Синхронизируем страницу
        if (pageParam) {
            const page = parseInt(pageParam, 10);
            if (!isNaN(page) && page > 0) {
                onPageChange(page);
            }
        } else {
            // Если в URL нет параметра page, но мы на странице > 1, сбрасываем на 1
            if (currentPage > 1) {
                onPageChange(1);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlSearchParams.toString(), currentPage, filters, sortBy]); // Колбэки стабильны, filters и sortBy нужны для сравнения

    // Синхронизация значений полей цены с фильтрами
    useEffect(() => {
        // Не синхронизируем во время инициализации из URL
        if (isInitializingFromUrlRef.current) {
            return;
        }
        onPriceFromValueChange(filters.priceFrom);
        onPriceToValueChange(filters.priceTo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.priceFrom, filters.priceTo]); // Колбэки стабильны

    // Синхронизация значений полей залпов с фильтрами
    useEffect(() => {
        // Не синхронизируем во время инициализации из URL
        if (isInitializingFromUrlRef.current) {
            return;
        }
        onShotsFromValueChange(filters.shotsFrom);
        onShotsToValueChange(filters.shotsTo);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.shotsFrom, filters.shotsTo]); // Колбэки стабильны

    return {
        updateURL,
        isInitializingFromUrlRef,
        isUpdatingURLRef,
    };
}

