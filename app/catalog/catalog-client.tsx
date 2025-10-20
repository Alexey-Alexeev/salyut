'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ActiveFilters } from '@/components/catalog/active-filters';
import { CatalogSearch } from '@/components/catalog/catalog-search';
import { CatalogDesktopFilters } from '@/components/catalog/catalog-desktop-filters';
import { CatalogMobileFilters } from '@/components/catalog/catalog-mobile-filters';
import { ViewModeControls } from '@/components/catalog/view-mode-controls';
import { CatalogSort } from '@/components/catalog/catalog-sort';
import { CatalogPaginationInfo } from '@/components/catalog/catalog-pagination-info';
import { ProductsGrid } from '@/components/catalog/products-grid';
import { CatalogEmptyState } from '@/components/catalog/catalog-empty-state';
import { fetchProducts } from '@/lib/api-client';
import { PRICE_VALID_UNTIL } from '@/lib/schema-constants';

// Типы
interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    category_id: string | null;
    images: string[] | null;
    is_popular: boolean | null;
    characteristics?: Record<string, any> | null;
    short_description?: string | null;
}

interface FilterState {
    categories: string[];
    priceFrom: string;
    priceTo: string;
    priceMin: number;
    priceMax: number;
    search: string;
}

interface InitialData {
    categories: Category[];
    products: Product[];
    pagination: {
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    stats: {
        minPrice: number;
        maxPrice: number;
    };
}

interface CatalogClientProps {
    initialData: InitialData;
    searchParams: { [key: string]: string | string[] | undefined };
}

export function CatalogClient({ initialData, searchParams }: CatalogClientProps) {
    const router = useRouter();
    const urlSearchParams = useSearchParams();

    // Основное состояние - инициализируем из server data
    const [categories] = useState<Category[]>(initialData.categories);
    const [products, setProducts] = useState<Product[]>(initialData.products);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialData.products);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState(initialData.pagination);

    // Сохраняем исходные данные для возврата при очистке фильтров
    const initialPagination = useRef(initialData.pagination);
    const initialProducts = useRef(initialData.products);

    // Состояние фильтров
    const [filters, setFilters] = useState<FilterState>({
        categories: [],
        priceFrom: '',
        priceTo: '',
        priceMin: initialData.stats.minPrice,
        priceMax: initialData.stats.maxPrice,
        search: '',
    });

    // Состояние интерфейса
    const [sortBy, setSortBy] = useState('name');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [priceFromValue, setPriceFromValue] = useState('');
    const [priceToValue, setPriceToValue] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const priceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastPageRef = useRef(1);
    const hasInitializedRef = useRef(false);
    const isInitializingFromUrlRef = useRef(false);
    const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRequestInProgressRef = useRef(false);
    const lastRequestIdRef = useRef<string | null>(null);

    // Стабилизируем список товаров для предотвращения лишних рендеров
    const stableProducts = useMemo(() => {
        return filteredProducts;
    }, [filteredProducts.length, filteredProducts.map(p => p.id).join(',')]);

    // Мемоизируем построение URL параметров
    const buildApiParams = useCallback((page: number = 1) => {
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', '20');
        params.set('sortBy', sortBy);

        if (filters.search.trim()) {
            params.set('search', filters.search.trim());
        }

        if (filters.categories.length > 0) {
            const categoryIds = categories
                .filter(cat => filters.categories.includes(cat.slug))
                .map(cat => cat.id);
            if (categoryIds.length > 0) {
                // Передаем все выбранные категории
                categoryIds.forEach(categoryId => {
                    params.append('categoryId', categoryId);
                });
            }
        }

        if (filters.priceFrom) {
            params.set('minPrice', filters.priceFrom);
        }
        if (filters.priceTo) {
            params.set('maxPrice', filters.priceTo);
        }

        return params.toString();
    }, [sortBy, filters, categories]); // Убрали pagination.page из зависимостей

    // Мемоизируем функцию сброса страницы
    const resetPage = useCallback(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // Функция для обновления URL с фильтрами
    const updateURL = useCallback((newFilters: Partial<FilterState>, newSortBy?: string, newPage?: number) => {
        // Используем текущий URL для получения параметров
        const currentUrl = typeof window !== 'undefined' ? window.location.search : '';
        const params = new URLSearchParams(currentUrl);

        // Очищаем существующие параметры фильтров
        params.delete('search');
        params.delete('category');
        params.delete('minPrice');
        params.delete('maxPrice');
        params.delete('sortBy');
        params.delete('page');

        // Добавляем новые параметры только если они не пустые
        if (newFilters.search?.trim()) {
            params.set('search', newFilters.search.trim());
        }

        if (newFilters.categories && newFilters.categories.length > 0) {
            newFilters.categories.forEach(category => {
                params.append('category', category);
            });
        }

        if (newFilters.priceFrom?.trim()) {
            params.set('minPrice', newFilters.priceFrom.trim());
        }

        if (newFilters.priceTo?.trim()) {
            params.set('maxPrice', newFilters.priceTo.trim());
        }

        if (newSortBy && newSortBy !== 'name') {
            params.set('sortBy', newSortBy);
        }

        if (newPage && newPage > 1) {
            params.set('page', newPage.toString());
        }

        // Обновляем URL без перезагрузки страницы
        const newURL = params.toString() ? `?${params.toString()}` : '';
        router.replace(`/catalog${newURL}`, { scroll: false });
    }, [router]);

    // Инициализация фильтров из URL (только один раз)
    useEffect(() => {
        if (hasInitializedRef.current) return;

        // Парсим URL параметры вручную для статического экспорта
        let categoryParam: string | string[] | undefined;
        let searchParam: string | undefined;
        let minPriceParam: string | undefined;
        let maxPriceParam: string | undefined;
        let sortByParam: string | undefined;

        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            categoryParam = urlParams.getAll('category');
            searchParam = urlParams.get('search') || undefined;
            minPriceParam = urlParams.get('minPrice') || undefined;
            maxPriceParam = urlParams.get('maxPrice') || undefined;
            sortByParam = urlParams.get('sortBy') || undefined;
        } else {
            // Fallback для SSR
            categoryParam = searchParams.category as string | string[];
            searchParam = searchParams.search as string;
            minPriceParam = searchParams.minPrice as string;
            maxPriceParam = searchParams.maxPrice as string;
            sortByParam = searchParams.sortBy as string;
        }

        // Отладочная информация
        console.log('🔍 CatalogClient Debug Info:');
        console.log('📍 URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
        console.log('📋 searchParams:', searchParams);
        console.log('📂 categories from initialData:', initialData.categories);
        console.log('🏷️ categoryParam:', categoryParam);
        console.log('🔍 URL Search Params:', typeof window !== 'undefined' ? new URLSearchParams(window.location.search).toString() : 'SSR');


        // Парсим категории (может быть массив)
        const categories = Array.isArray(categoryParam) ? categoryParam : (categoryParam ? [categoryParam] : []);

        // Проверяем, есть ли параметры в URL
        const hasUrlParams = (categoryParam && categoryParam.length > 0) || searchParam || minPriceParam || maxPriceParam || sortByParam;

        if (hasUrlParams) {

            // Устанавливаем флаг инициализации из URL
            isInitializingFromUrlRef.current = true;

            // Очищаем предыдущий таймаут
            if (initializationTimeoutRef.current) {
                clearTimeout(initializationTimeoutRef.current);
            }

            // Устанавливаем флаг инициализации с задержкой
            initializationTimeoutRef.current = setTimeout(() => {
                setIsInitializing(true);
            }, 100);

            resetPage();
            setFilters(prev => ({
                ...prev,
                categories,
                search: searchParam || '',
                priceFrom: minPriceParam || '',
                priceTo: maxPriceParam || '',
            }));

            if (sortByParam) {
                setSortBy(sortByParam);
            }

            // Синхронизируем значения полей
            if (searchParam) {
                setSearchValue(searchParam);
            }
            if (minPriceParam) {
                setPriceFromValue(minPriceParam);
            }
            if (maxPriceParam) {
                setPriceToValue(maxPriceParam);
            }
        } else {
            // Если нет параметров URL, сразу завершаем инициализацию
            setIsInitializing(false);
        }

        hasInitializedRef.current = true;
    }, [searchParams, resetPage]);

    // Синхронизация значений полей цены с фильтрами
    useEffect(() => {
        // Не синхронизируем во время инициализации из URL
        if (isInitializingFromUrlRef.current) {
            return;
        }
        setPriceFromValue(filters.priceFrom);
        setPriceToValue(filters.priceTo);
    }, [filters.priceFrom, filters.priceTo]);

    // Применение всех фильтров через серверные запросы
    useEffect(() => {

        const applyAllFilters = async () => {

            // Не применяем фильтры при смене страницы (это делает отдельный useEffect)
            if (pagination.page !== lastPageRef.current) {
                return;
            }

            // Не применяем фильтры, если нет активных фильтров (используем данные с сервера)
            const hasActiveFilters = filters.search.trim() ||
                filters.categories.length > 0 ||
                filters.priceFrom ||
                filters.priceTo;

            if (!hasActiveFilters && sortBy === 'name') {
                // Возвращаемся к исходным данным с сервера
                setFilteredProducts(initialProducts.current);
                setPagination({
                    ...initialPagination.current,
                    page: 1, // Сбрасываем на первую страницу
                });
                // Завершаем инициализацию, если она была активна
                if (isInitializing) {
                    setIsInitializing(false);
                    isInitializingFromUrlRef.current = false;
                }
                return;
            }

            // Создаем уникальный идентификатор для запроса
            const requestId = `${Date.now()}-${Math.random()}`;
            const requestParams = buildApiParams();

            // Если уже идет запрос с теми же параметрами, пропускаем
            if (isRequestInProgressRef.current && lastRequestIdRef.current === requestParams) {
                return;
            }


            isRequestInProgressRef.current = true;
            lastRequestIdRef.current = requestParams;
            setIsFiltering(true);

            try {
                // Преобразуем URLSearchParams в объект фильтров
                const categoryIds = categories
                    .filter(cat => filters.categories.includes(cat.slug))
                    .map(cat => cat.id);

                // Отладочная информация для фильтрации
                console.log('🔍 Filter Debug Info:');
                console.log('📂 Available categories:', categories.map(cat => ({ id: cat.id, name: cat.name, slug: cat.slug })));
                console.log('🏷️ Selected category slugs:', filters.categories);
                console.log('🆔 Category IDs for API:', categoryIds);
                console.log('🔍 Filter state:', filters);

                const data = await fetchProducts({
                    search: filters.search.trim() || undefined,
                    categoryId: categoryIds.length > 0 ? categoryIds : undefined,
                    minPrice: filters.priceFrom ? Number(filters.priceFrom) : undefined,
                    maxPrice: filters.priceTo ? Number(filters.priceTo) : undefined,
                    sortBy: sortBy,
                    page: 1,
                    limit: 20,
                });

                console.log('📦 API Response:', data);

                setFilteredProducts(data.products || []);
                setPagination(data.pagination || pagination);
            } catch (error) {
                console.error('Error applying filters:', error);
            } finally {
                setIsFiltering(false);
                isRequestInProgressRef.current = false;
                // Завершаем инициализацию после применения фильтров
                if (isInitializing) {
                    setIsInitializing(false);
                    isInitializingFromUrlRef.current = false;
                }
            }
        };

        // Если мы инициализируемся из URL, делаем задержку перед применением фильтров
        if (isInitializingFromUrlRef.current) {
            const timeoutId = setTimeout(() => {
                applyAllFilters();
            }, 200);

            return () => {
                clearTimeout(timeoutId);
            };
        }

        applyAllFilters();
    }, [filters, sortBy, buildApiParams]); // Убрали pagination и isInitializing из зависимостей

    // Обработчики событий
    const handleCategoryChange = useCallback(
        (categorySlug: string, checked: boolean) => {
            resetPage();
            const newCategories = checked
                ? [...filters.categories, categorySlug]
                : filters.categories.filter(slug => slug !== categorySlug);

            const newFilters = {
                ...filters,
                categories: newCategories,
            };

            setFilters(prev => ({
                ...prev,
                categories: newCategories,
            }));
            updateURL(newFilters, sortBy);
        },
        [resetPage, filters, sortBy, updateURL]
    );

    const handlePriceChange = useCallback((from: string, to: string) => {
        resetPage();
        const newFilters = {
            ...filters,
            priceFrom: from,
            priceTo: to,
        };
        setFilters(prev => ({
            ...prev,
            priceFrom: from,
            priceTo: to,
        }));
        updateURL(newFilters, sortBy);
    }, [resetPage, filters, sortBy, updateURL]);

    const handleSortChange = useCallback((newSortBy: string) => {
        setSortBy(newSortBy);
        updateURL(filters, newSortBy);
    }, [filters, updateURL]);

    const handleRemoveCategory = useCallback((categorySlug: string) => {
        resetPage();
        const newCategories = filters.categories.filter(slug => slug !== categorySlug);
        const newFilters = {
            ...filters,
            categories: newCategories,
        };
        setFilters(prev => ({
            ...prev,
            categories: newCategories,
        }));
        updateURL(newFilters, sortBy);
    }, [resetPage, filters, sortBy, updateURL]);

    const handleClearPrice = useCallback(() => {
        resetPage();
        const newFilters = {
            ...filters,
            priceFrom: '',
            priceTo: '',
        };
        setFilters(prev => ({
            ...prev,
            priceFrom: '',
            priceTo: '',
        }));
        updateURL(newFilters, sortBy);
    }, [resetPage, filters, sortBy, updateURL]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);

        // Очищаем предыдущий таймаут
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем поиск
        if (value.trim() === '') {
            setIsSearching(false);
            resetPage();
            setFilters(prev => ({
                ...prev,
                search: '',
            }));
            return;
        }

        // Показываем индикатор поиска
        setIsSearching(true);

        // Устанавливаем новый таймаут для debouncing (уменьшили до 300ms)
        searchTimeoutRef.current = setTimeout(() => {
            resetPage();
            const newFilters = {
                ...filters,
                search: value,
            };
            setFilters(prev => ({
                ...prev,
                search: value,
            }));
            updateURL(newFilters, sortBy);
            setIsSearching(false);
        }, 300); // 300ms задержка для более быстрого отклика
    }, [resetPage]);

    const handlePriceFromChange = useCallback((value: string) => {
        setPriceFromValue(value);

        // Очищаем предыдущий таймаут
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем фильтр
        if (value.trim() === '') {
            resetPage();
            setFilters(prev => ({
                ...prev,
                priceFrom: '',
            }));
            return;
        }

        // Устанавливаем новый таймаут для debouncing
        priceTimeoutRef.current = setTimeout(() => {
            resetPage();
            const newFilters = {
                ...filters,
                priceFrom: value,
            };
            setFilters(prev => ({
                ...prev,
                priceFrom: value,
            }));
            updateURL(newFilters, sortBy);
        }, 500); // 500ms задержка для цены (чуть больше, чем для поиска)
    }, [resetPage]);

    const handlePriceToChange = useCallback((value: string) => {
        setPriceToValue(value);

        // Очищаем предыдущий таймаут
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем фильтр
        if (value.trim() === '') {
            resetPage();
            setFilters(prev => ({
                ...prev,
                priceTo: '',
            }));
            return;
        }

        // Устанавливаем новый таймаут для debouncing
        priceTimeoutRef.current = setTimeout(() => {
            resetPage();
            const newFilters = {
                ...filters,
                priceTo: value,
            };
            setFilters(prev => ({
                ...prev,
                priceTo: value,
            }));
            updateURL(newFilters, sortBy);
        }, 500); // 500ms задержка для цены (чуть больше, чем для поиска)
    }, [resetPage]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        setIsSearching(false);
        resetPage();
        const newFilters = {
            ...filters,
            search: '',
        };
        setFilters(prev => ({
            ...prev,
            search: '',
        }));
        updateURL(newFilters, sortBy);

        // Очищаем таймаут
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    }, [resetPage, filters, sortBy, updateURL]);

    const handleClearAllFilters = useCallback(() => {
        setSearchValue('');
        setPriceFromValue('');
        setPriceToValue('');
        setIsSearching(false);
        resetPage();
        setSortBy('name'); // Сбрасываем сортировку к умолчанию
        const newFilters = {
            categories: [],
            priceFrom: '',
            priceTo: '',
            search: '',
        };
        setFilters(prev => ({
            ...prev,
            ...newFilters,
        }));
        updateURL(newFilters, 'name');

        // Очищаем таймауты
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }
        // Сбрасываем флаг запроса
        isRequestInProgressRef.current = false;
        lastRequestIdRef.current = null;
    }, [resetPage, updateURL]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({
            ...prev,
            page,
        }));
        
        // Показываем loader в мобильной версии вместо скролла
        if (window.innerWidth < 768) {
            setIsPaginationLoading(true);
        }
    }, []);

    // Сброс страницы при изменении сортировки
    useEffect(() => {
        if (pagination.page > 1) {
            resetPage();
        }
    }, [sortBy, resetPage]);

    // Отдельный useEffect для смены страницы
    useEffect(() => {
        if (pagination.page !== lastPageRef.current) {
            const fetchPage = async () => {
                setIsFiltering(true);

                try {
                    // Преобразуем URLSearchParams в объект фильтров
                    const categoryIds = categories
                        .filter(cat => filters.categories.includes(cat.slug))
                        .map(cat => cat.id);

                    const data = await fetchProducts({
                        search: filters.search.trim() || undefined,
                        categoryId: categoryIds.length > 0 ? categoryIds : undefined,
                        minPrice: filters.priceFrom ? Number(filters.priceFrom) : undefined,
                        maxPrice: filters.priceTo ? Number(filters.priceTo) : undefined,
                        sortBy: sortBy,
                        page: pagination.page,
                        limit: 20,
                    });

                    setFilteredProducts(data.products || []);
                    setPagination(data.pagination || pagination);
                } catch (error) {
                    console.error('Error fetching page:', error);
                } finally {
                    setIsFiltering(false);
                    setIsPaginationLoading(false);
                }
            };

            fetchPage();
            lastPageRef.current = pagination.page;
        }
    }, [pagination.page, categories, filters, sortBy]);

    // Очистка таймаутов при размонтировании
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (priceTimeoutRef.current) {
                clearTimeout(priceTimeoutRef.current);
            }
            if (initializationTimeoutRef.current) {
                clearTimeout(initializationTimeoutRef.current);
            }
            // Сбрасываем флаг запроса
            isRequestInProgressRef.current = false;
            lastRequestIdRef.current = null;
        };
    }, []);

    // Показываем загрузку во время инициализации с URL параметрами
    if (isInitializing) {
        return (
            <div className="container mx-auto px-4 py-8 animate-in fade-in duration-200">
                <div className="mb-6">
                    <Breadcrumb items={[{ label: 'Каталог товаров' }]} />
                </div>
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Применяем фильтры...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-8 animate-in fade-in duration-300">
            {/* JSON-LD Structured Data для каталога */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Каталог фейерверков и салютов",
                        "description": "Каталог качественных фейерверков и салютов в Москве и МО. Большой выбор пиротехники от проверенных производителей.",
                        "url": "https://salutgrad.ru/catalog",
                        "mainEntity": {
                            "@type": "ItemList",
                            "name": "Каталог фейерверков и салютов",
                            "description": "Список всех доступных фейерверков и салютов",
                            "numberOfItems": pagination.totalCount,
                            "itemListElement": filteredProducts.slice(0, 20).map((product, index) => ({
                                "@type": "Product",
                                "position": index + 1,
                                "name": product.name,
                                "description": product.short_description || `Качественный ${product.name} для праздников`,
                                "image": product.images?.[0] || "https://salutgrad.ru/images/product-placeholder.jpg",
                                "brand": {
                                    "@type": "Brand",
                                    "name": "СалютГрад"
                                },
                                "category": product.category_id ? categories.find(cat => cat.id === product.category_id)?.name || "Пиротехника" : "Пиротехника",
                                "sku": product.id,
                                "url": `https://salutgrad.ru/product/${product.slug}`,
                                "offers": {
                                    "@type": "Offer",
                                    "price": product.price,
                                    "priceCurrency": "RUB",
                                    "priceValidUntil": PRICE_VALID_UNTIL,
                                    "availability": "https://schema.org/InStock",
                                    "seller": {
                                        "@type": "Organization",
                                        "name": "СалютГрад",
                                        "url": "https://salutgrad.ru"
                                    },
                                        "shippingDetails": {
                                            "@type": "OfferShippingDetails",
                                            "shippingRate": {
                                                "@type": "MonetaryAmount",
                                                "value": "500",
                                                "currency": "RUB"
                                            },
                                            "deliveryTime": {
                                                "@type": "ShippingDeliveryTime",
                                                "handlingTime": {
                                                    "@type": "QuantitativeValue",
                                                    "minValue": 0,
                                                    "maxValue": 1,
                                                    "unitCode": "DAY"
                                                },
                                                "transitTime": {
                                                    "@type": "QuantitativeValue",
                                                    "minValue": 1,
                                                    "maxValue": 3,
                                                    "unitCode": "DAY"
                                                },
                                                "businessDays": {
                                                    "@type": "OpeningHoursSpecification",
                                                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                                                },
                                                "cutoffTime": "23:59"
                                            },
                                            "shippingDestination": {
                                                "@type": "DefinedRegion",
                                                "addressCountry": "RU",
                                                "addressRegion": "Московская область",
                                                "addressLocality": "Москва"
                                            }
                                        },
                                    "pickupDetails": {
                                        "@type": "OfferShippingDetails",
                                        "shippingRate": {
                                            "@type": "MonetaryAmount",
                                            "value": "0",
                                            "currency": "RUB"
                                        },
                                        "deliveryTime": {
                                            "@type": "ShippingDeliveryTime",
                                            "handlingTime": {
                                                "@type": "QuantitativeValue",
                                                "minValue": 0,
                                                "maxValue": 1,
                                                "unitCode": "DAY"
                                            },
                                            "transitTime": {
                                                "@type": "QuantitativeValue",
                                                "minValue": 0,
                                                "maxValue": 0,
                                                "unitCode": "DAY"
                                            },
                                            "businessDays": {
                                                "@type": "OpeningHoursSpecification",
                                                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                                                "opens": "09:00",
                                                "closes": "21:00"
                                            }
                                        },
                                        "shippingDestination": {
                                            "@type": "DefinedRegion",
                                            "addressCountry": "RU",
                                            "addressRegion": "Московская область",
                                            "addressLocality": "Балашиха",
                                            "streetAddress": "Рассветная улица, 14",
                                            "postalCode": "143921"
                                        }
                                    },
                                    "hasMerchantReturnPolicy": {
                                        "@type": "MerchantReturnPolicy",
                                        "applicableCountry": "RU",
                                        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                                        "merchantReturnDays": 7,
                                        "returnMethod": "https://schema.org/ReturnByMail",
                                        "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility"
                                    }
                                },
                            }))
                        },
                        "breadcrumb": {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Главная",
                                    "item": "https://salutgrad.ru"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Каталог товаров",
                                    "item": "https://salutgrad.ru/catalog"
                                }
                            ]
                        }
                    })
                }}
            />

            {/* Preload критических изображений */}
            {/* Breadcrumb */}
            <div className="mb-6">
                <Breadcrumb items={[{ label: 'Каталог товаров' }]} />
            </div>

            {/* Поиск */}
            <CatalogSearch
                value={searchValue}
                hasActiveSearch={!!filters.search}
                isSearching={isSearching}
                onChange={handleSearchChange}
                onClear={handleClearSearch}
            />

            <div className="flex flex-col gap-8 lg:flex-row">
                {/* Фильтры для десктопа */}
                <CatalogDesktopFilters
                    categories={categories}
                    selectedCategories={filters.categories}
                    priceFrom={filters.priceFrom}
                    priceTo={filters.priceTo}
                    minPrice={filters.priceMin}
                    maxPrice={filters.priceMax}
                    onCategoryChange={handleCategoryChange}
                    onPriceChange={handlePriceChange}
                    onPriceFromChange={handlePriceFromChange}
                    onPriceToChange={handlePriceToChange}
                />

                {/* Основной контент */}
                <div className="flex-1">
                    {/* Мобильные фильтры и управление */}
                    <div className="mb-6 flex flex-col gap-4">
                        {/* Мобильные фильтры */}
                        <div className="flex items-center justify-between lg:hidden">
                            <CatalogMobileFilters
                                isOpen={isMobileFiltersOpen}
                                onOpenChange={setIsMobileFiltersOpen}
                                categories={categories}
                                selectedCategories={filters.categories}
                                priceFrom={filters.priceFrom}
                                priceTo={filters.priceTo}
                                minPrice={filters.priceMin}
                                maxPrice={filters.priceMax}
                                onCategoryChange={handleCategoryChange}
                                onPriceChange={handlePriceChange}
                                onPriceFromChange={handlePriceFromChange}
                                onPriceToChange={handlePriceToChange}
                            />

                            <ViewModeControls
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                            />
                        </div>

                        {/* Управление для десктопа */}
                        <div className="hidden items-center justify-between lg:flex">
                            <span className="text-muted-foreground text-sm">
                                Найдено: {filteredProducts.length}{' '}
                                {filteredProducts.length === 1 ? 'товар' : 'товаров'}
                            </span>

                            <div className="flex items-center gap-3">
                                <ViewModeControls
                                    viewMode={viewMode}
                                    onViewModeChange={setViewMode}
                                />

                                <CatalogSort value={sortBy} onChange={handleSortChange} />
                            </div>
                        </div>

                        {/* Счетчик и сортировка для мобильных */}
                        <div className="flex items-center justify-between lg:hidden">
                            <span className="text-muted-foreground text-sm">
                                Найдено: {filteredProducts.length}
                            </span>

                            <CatalogSort value={sortBy} onChange={handleSortChange} isMobile />
                        </div>
                    </div>

                    {/* Активные фильтры */}
                    <ActiveFilters
                        categories={categories}
                        selectedCategories={filters.categories}
                        priceFrom={filters.priceFrom}
                        priceTo={filters.priceTo}
                        search={filters.search}
                        onRemoveCategory={handleRemoveCategory}
                        onClearPrice={handleClearPrice}
                        onClearSearch={handleClearSearch}
                        onClearAll={handleClearAllFilters}
                    />

                    {/* Пагинация сверху */}
                    {filteredProducts.length > 0 && (
                        <div className="mb-6">
                            <CatalogPaginationInfo
                                pagination={pagination}
                                onPageChange={handlePageChange}
                                showTotalCount
                            />
                        </div>
                    )}

                    {/* Сетка товаров */}
                    <ProductsGrid
                        products={stableProducts}
                        viewMode={viewMode}
                        isLoading={loading || isFiltering}
                    />

                    {/* Пагинация снизу */}
                    {filteredProducts.length > 0 && (
                        <div className="mt-8">
                            <CatalogPaginationInfo
                                pagination={pagination}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}

                    {/* Loader для пагинации в мобильной версии */}
                    {isPaginationLoading && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm md:hidden">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
                                <p className="text-sm font-medium text-gray-700">Загружаем товары...</p>
                            </div>
                        </div>
                    )}

                    {/* Сообщение о пустых результатах */}
                    {filteredProducts.length === 0 && (
                        <CatalogEmptyState onClearFilters={handleClearAllFilters} />
                    )}
                </div>
            </div>
        </div>
    );
}
