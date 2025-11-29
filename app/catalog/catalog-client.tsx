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
import { SinglePetardProductLayout } from '@/components/catalog/single-petard-product-layout';
import { PRICE_VALID_UNTIL } from '@/lib/schema-constants';
import { CatalogCanonical } from '@/components/catalog/catalog-canonical';
import { findSimilarProducts } from '@/lib/similar-products';
import { useCatalogScrollRestore } from '@/hooks/use-catalog-scroll-restore';
import { useCatalogUrlSync } from '@/hooks/use-catalog-url-sync';
import { useCatalogFilters, FilterState } from '@/hooks/use-catalog-filters';
import { useCatalogProducts } from '@/hooks/use-catalog-products';

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
    category_name?: string | null;
    category_slug?: string | null;
    images: string[] | null;
    video_url?: string | null;
    is_popular: boolean | null;
    characteristics?: Record<string, any> | null;
    short_description?: string | null;
}

// FilterState импортирован из hooks/use-catalog-filters

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

// Вспомогательная функция для проверки, является ли товар петардой
function isPetard(product: Product): boolean {
    return product.category_slug === 'firecrackers' || product.category_name === 'Петарды';
}

export function CatalogClient({ initialData, searchParams }: CatalogClientProps) {
    const router = useRouter();
    const urlSearchParams = useSearchParams();

    // Основное состояние - инициализируем из server data
    const [categories] = useState<Category[]>(initialData.categories);
    const [products, setProducts] = useState<Product[]>(initialData.products);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Вычисляем min/max значения залпов из всех товаров
    const calculateShotsStats = useCallback((productsList: Product[]) => {
        const shotsValues: number[] = [];
        productsList.forEach(product => {
            const characteristics = product.characteristics || {};
            const shotsStr = characteristics['Кол-во залпов'];
            if (shotsStr) {
                const shots = parseInt(shotsStr, 10);
                if (!isNaN(shots) && shots > 0) {
                    shotsValues.push(shots);
                }
            }
        });
        
        if (shotsValues.length > 0) {
            return {
                min: Math.min(...shotsValues),
                max: Math.max(...shotsValues),
            };
        }
        return { min: 0, max: 100 };
    }, []);

    const initialShotsStats = calculateShotsStats(initialData.products);
    const [shotsStats, setShotsStats] = useState(initialShotsStats);
    
    // Состояние фильтров через useReducer
    const {
        filters,
        setFilters,
        updateStats,
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
        clearAll,
        setPriceFrom,
        setPriceTo,
        setShotsFrom,
        setShotsTo,
    } = useCatalogFilters({
        initialState: {
            categories: [],
            priceFrom: '',
            priceTo: '',
            priceMin: initialData.stats.minPrice,
            priceMax: initialData.stats.maxPrice,
            shotsFrom: '',
            shotsTo: '',
            shotsMin: initialShotsStats.min,
            shotsMax: initialShotsStats.max,
            search: '',
            eventType: null,
        },
    });

    // Обновляем ref при изменении фильтров
    useEffect(() => {
        filtersRef.current = filters;
    }, [filters]);

    // Состояние интерфейса
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [priceFromValue, setPriceFromValue] = useState('');
    const [priceToValue, setPriceToValue] = useState('');
    const [shotsFromValue, setShotsFromValue] = useState('');
    const [shotsToValue, setShotsToValue] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const priceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shotsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Ref для хранения актуальных фильтров (для использования в обработчиках с debounce)
    const filtersRef = useRef(filters);
    
    // Ref для отслеживания, идет ли инициализация из URL (используется в обоих хуках)
    const isInitializingFromUrlRef = useRef(false);

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

        if (filters.shotsFrom) {
            params.set('minShots', filters.shotsFrom);
        }
        if (filters.shotsTo) {
            params.set('maxShots', filters.shotsTo);
        }

        if (filters.eventType) {
            params.set('eventType', filters.eventType);
        }

        return params.toString();
    }, [sortBy, filters, categories]);

    // Хук для управления загрузкой товаров
    const {
        filteredProducts,
        allProducts,
        popularProducts,
        pagination,
        setPagination,
        isFiltering,
        setIsFiltering,
        lastPageRef,
        resetRequestState,
    } = useCatalogProducts({
        filters,
        sortBy,
        categories,
        initialData: {
            products: initialData.products,
            pagination: initialData.pagination,
        },
        isInitializingFromUrlRef,
        setIsInitializing,
        buildApiParams,
        setIsPaginationLoading,
    });

    // Мемоизируем функцию сброса страницы
    const resetPage = useCallback(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, [setPagination]);

    // Хук для синхронизации URL с фильтрами
    const { updateURL, isUpdatingURLRef } = useCatalogUrlSync({
        filters,
        sortBy,
        currentPage: pagination.page,
        searchParams,
        onFiltersChange: setFilters,
        onSortByChange: setSortBy,
        onPageChange: (page) => {
            setPagination(prev => {
                if (prev.page !== page) {
                    lastPageRef.current = page;
                    return { ...prev, page };
                }
                return prev;
            });
        },
        onSearchValueChange: setSearchValue,
        onPriceFromValueChange: setPriceFromValue,
        onPriceToValueChange: setPriceToValue,
        onShotsFromValueChange: setShotsFromValue,
        onShotsToValueChange: setShotsToValue,
        onInitializingChange: setIsInitializing,
        onLastPageRefUpdate: (page) => {
            lastPageRef.current = page;
        },
        isInitializingFromUrlRef,
    });

    // Хук для восстановления позиции прокрутки
    const { isRestoringScroll, clearScrollPosition } = useCatalogScrollRestore({
        currentPage: pagination.page,
        filteredProductsCount: filteredProducts.length,
        isFiltering,
        isUpdatingURLRef,
    });

    // Стабилизируем список товаров для предотвращения лишних рендеров
    const stableProducts = useMemo(() => {
        return filteredProducts;
    }, [filteredProducts]);

    useEffect(() => {
        const stats = calculateShotsStats(allProducts);
        setShotsStats(stats);
        // Обновляем min/max в фильтрах
        updateStats({
            shotsMin: stats.min,
            shotsMax: stats.max,
        });
    }, [allProducts, calculateShotsStats, updateStats]);

    // Логика загрузки товаров теперь находится в useCatalogProducts

    // Обработчики событий
    const handleCategoryChange = useCallback(
        (categorySlug: string, checked: boolean) => {
            resetPage();
            if (checked) {
                addCategory(categorySlug);
            } else {
                removeCategory(categorySlug);
            }
            // Вычисляем новые фильтры для updateURL
            const newCategories = checked
                ? [...filters.categories, categorySlug]
                : filters.categories.filter(slug => slug !== categorySlug);
            updateURL({ ...filters, categories: newCategories }, sortBy);
        },
        [resetPage, filters, sortBy, updateURL, addCategory, removeCategory]
    );

    const handlePriceChange = useCallback((from: string, to: string) => {
        resetPage();
        setPrice(from, to);
        updateURL({ ...filters, priceFrom: from, priceTo: to }, sortBy);
    }, [resetPage, filters, sortBy, updateURL, setPrice]);

    const handleSortChange = useCallback((newSortBy: string) => {
        // всегда сбрасываем страницу при смене сортировки (но сброс ТОЛЬКО по намерению)
        setSortBy(newSortBy);
        setPagination(prev => ({ ...prev, page: 1 }));
        updateURL(filters, newSortBy, 1);
    }, [filters, updateURL]);

    const handleRemoveCategory = useCallback((categorySlug: string) => {
        resetPage();
        removeCategory(categorySlug);
        const newCategories = filters.categories.filter(slug => slug !== categorySlug);
        updateURL({ ...filters, categories: newCategories }, sortBy);
    }, [resetPage, filters, sortBy, updateURL, removeCategory]);

    const handleClearPrice = useCallback(() => {
        resetPage();
        clearPrice();
        updateURL({ ...filters, priceFrom: '', priceTo: '' }, sortBy);
    }, [resetPage, filters, sortBy, updateURL, clearPrice]);

    const handleShotsChange = useCallback((from: string, to: string) => {
        resetPage();
        setShots(from, to);
        updateURL({ ...filters, shotsFrom: from, shotsTo: to }, sortBy);
    }, [resetPage, filters, sortBy, updateURL, setShots]);

    const handleEventTypeChange = useCallback((eventType: 'wedding' | 'birthday' | 'new_year' | null) => {
        resetPage();
        setEventType(eventType);
        updateURL({ ...filters, eventType }, sortBy);
    }, [resetPage, filters, sortBy, updateURL, setEventType]);

    const handleShotsFromChange = useCallback((value: string) => {
        setShotsFromValue(value);

        // Очищаем предыдущий таймаут
        if (shotsTimeoutRef.current) {
            clearTimeout(shotsTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем фильтр
        if (value.trim() === '') {
            resetPage();
            setShotsFrom('');
            updateURL({ ...filters, shotsFrom: '' }, sortBy);
            return;
        }

        // Устанавливаем новый таймаут для debouncing
        shotsTimeoutRef.current = setTimeout(() => {
            resetPage();
            setShotsFrom(value);
            // Используем актуальные фильтры из ref
            updateURL({ ...filtersRef.current, shotsFrom: value }, sortBy);
        }, 500);
    }, [resetPage, sortBy, updateURL, setShotsFrom]);

    const handleShotsToChange = useCallback((value: string) => {
        setShotsToValue(value);

        // Очищаем предыдущий таймаут
        if (shotsTimeoutRef.current) {
            clearTimeout(shotsTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем фильтр
        if (value.trim() === '') {
            resetPage();
            setShotsTo('');
            updateURL({ ...filters, shotsTo: '' }, sortBy);
            return;
        }

        // Устанавливаем новый таймаут для debouncing
        shotsTimeoutRef.current = setTimeout(() => {
            resetPage();
            setShotsTo(value);
            // Используем актуальные фильтры из ref
            updateURL({ ...filtersRef.current, shotsTo: value }, sortBy);
        }, 500);
    }, [resetPage, sortBy, updateURL, setShotsTo]);

    const handleClearShots = useCallback(() => {
        setShotsFromValue('');
        setShotsToValue('');
        resetPage();
        clearShots();
        updateURL({ ...filters, shotsFrom: '', shotsTo: '' }, sortBy);

        // Очищаем таймаут
        if (shotsTimeoutRef.current) {
            clearTimeout(shotsTimeoutRef.current);
        }
    }, [resetPage, filters, sortBy, updateURL, clearShots]);

    const handleClearEventType = useCallback(() => {
        resetPage();
        clearEventType();
        updateURL({ ...filters, eventType: null }, sortBy);
    }, [resetPage, filters, sortBy, updateURL, clearEventType]);

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
            clearSearch();
            return;
        }

        // Показываем индикатор поиска
        setIsSearching(true);

        // Устанавливаем новый таймаут для debouncing (уменьшили до 300ms)
        searchTimeoutRef.current = setTimeout(() => {
            resetPage();
            setSearch(value); // Это также сбросит eventType согласно reducer
            // Используем актуальные фильтры из ref
            updateURL({ ...filtersRef.current, search: value, eventType: null }, sortBy);
            setIsSearching(false);
        }, 300); // 300ms задержка для более быстрого отклика
    }, [resetPage, sortBy, updateURL, setSearch, clearSearch]);

    const handlePriceFromChange = useCallback((value: string) => {
        setPriceFromValue(value);

        // Очищаем предыдущий таймаут
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем фильтр
        if (value.trim() === '') {
            resetPage();
            setPriceFrom('');
            updateURL({ ...filters, priceFrom: '' }, sortBy);
            return;
        }

        // Устанавливаем новый таймаут для debouncing
        priceTimeoutRef.current = setTimeout(() => {
            resetPage();
            setPriceFrom(value);
            // Используем актуальные фильтры из ref
            updateURL({ ...filtersRef.current, priceFrom: value }, sortBy);
        }, 500); // 500ms задержка для цены (чуть больше, чем для поиска)
    }, [resetPage, sortBy, updateURL, setPriceFrom]);

    const handlePriceToChange = useCallback((value: string) => {
        setPriceToValue(value);

        // Очищаем предыдущий таймаут
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем фильтр
        if (value.trim() === '') {
            resetPage();
            setPriceTo('');
            updateURL({ ...filters, priceTo: '' }, sortBy);
            return;
        }

        // Устанавливаем новый таймаут для debouncing
        priceTimeoutRef.current = setTimeout(() => {
            resetPage();
            setPriceTo(value);
            // Используем актуальные фильтры из ref
            updateURL({ ...filtersRef.current, priceTo: value }, sortBy);
        }, 500); // 500ms задержка для цены (чуть больше, чем для поиска)
    }, [resetPage, sortBy, updateURL, setPriceTo]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        setIsSearching(false);
        resetPage();
        clearSearch();
        updateURL({ ...filters, search: '' }, sortBy);

        // Очищаем таймаут
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    }, [resetPage, filters, sortBy, updateURL, clearSearch]);

    const handleClearAllFilters = useCallback(() => {
        setSearchValue('');
        setPriceFromValue('');
        setPriceToValue('');
        setShotsFromValue('');
        setShotsToValue('');
        setIsSearching(false);
        resetPage();
        setSortBy('popular'); // Сбрасываем сортировку к умолчанию
        clearAll();
        const clearedFilters = {
            categories: [],
            priceFrom: '',
            priceTo: '',
            shotsFrom: '',
            shotsTo: '',
            search: '',
            eventType: null,
        };
        updateURL(clearedFilters, 'popular');

        // Очищаем таймауты
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }
        if (shotsTimeoutRef.current) {
            clearTimeout(shotsTimeoutRef.current);
        }
        // Сбрасываем флаг запроса
        resetRequestState();
    }, [resetPage, updateURL, clearAll, resetRequestState]);

    const handlePageChange = useCallback((page: number) => {
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
    }, [filters, sortBy, updateURL, clearScrollPosition]);

    // Логика загрузки товаров при смене страницы и загрузка всех товаров теперь находится в useCatalogProducts

    // Очистка таймаутов при размонтировании
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (priceTimeoutRef.current) {
                clearTimeout(priceTimeoutRef.current);
            }
            if (shotsTimeoutRef.current) {
                clearTimeout(shotsTimeoutRef.current);
            }
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
            <CatalogCanonical />
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
                    shotsFrom={filters.shotsFrom}
                    shotsTo={filters.shotsTo}
                    minShots={filters.shotsMin}
                    maxShots={filters.shotsMax}
                    onCategoryChange={handleCategoryChange}
                    onPriceChange={handlePriceChange}
                    onPriceFromChange={handlePriceFromChange}
                    onPriceToChange={handlePriceToChange}
                    onShotsChange={handleShotsChange}
                    onShotsFromChange={handleShotsFromChange}
                    onShotsToChange={handleShotsToChange}
                    selectedEventType={filters.eventType}
                    onEventTypeChange={handleEventTypeChange}
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
                                shotsFrom={filters.shotsFrom}
                                shotsTo={filters.shotsTo}
                                minShots={filters.shotsMin}
                                maxShots={filters.shotsMax}
                                onCategoryChange={handleCategoryChange}
                                onPriceChange={handlePriceChange}
                                onPriceFromChange={handlePriceFromChange}
                                onPriceToChange={handlePriceToChange}
                                onShotsChange={handleShotsChange}
                                onShotsFromChange={handleShotsFromChange}
                                onShotsToChange={handleShotsToChange}
                                selectedEventType={filters.eventType}
                                onEventTypeChange={handleEventTypeChange}
                            />

                            <ViewModeControls
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                            />
                        </div>

                        {/* Управление для десктопа */}
                        <div className="hidden items-center justify-between lg:flex">
                            <span className="text-muted-foreground text-sm">
                                На этой странице: {filteredProducts.length}{' '}
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
                                На этой странице: {filteredProducts.length}
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
                        shotsFrom={filters.shotsFrom}
                        shotsTo={filters.shotsTo}
                        search={filters.search}
                        eventType={filters.eventType}
                        onRemoveCategory={handleRemoveCategory}
                        onClearPrice={handleClearPrice}
                        onClearShots={handleClearShots}
                        onClearSearch={handleClearSearch}
                        onClearEventType={handleClearEventType}
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

                    {/* Сетка товаров с мотивационным блоком для одного товара-петарды */}
                    {!loading && !isFiltering && filteredProducts.length === 1 && isPetard(filteredProducts[0]) ? (
                        <SinglePetardProductLayout products={stableProducts} />
                    ) : (
                        <ProductsGrid
                            products={stableProducts}
                            viewMode={viewMode}
                            isLoading={loading || isFiltering}
                        />
                    )}

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

                    {/* Loader при возврате из карточки товара */}
                    {isRestoringScroll && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
                                <p className="text-sm font-medium text-gray-700">Загружаем каталог...</p>
                            </div>
                        </div>
                    )}

                    {/* Сообщение о пустых результатах */}
                    {filteredProducts.length === 0 && (() => {
                        // Ищем похожие товары только если есть поисковый запрос
                        const searchQuery = filters.search?.trim();
                        const similarProducts = searchQuery && allProducts.length > 0
                            ? findSimilarProducts(searchQuery, allProducts, 2)
                            : [];
                        
                        // Если похожих товаров меньше 2, дополняем популярными
                        const productsToShow = [...similarProducts];
                        
                        // Если не хватает до 2, добавляем популярные товары
                        if (productsToShow.length < 2 && popularProducts.length > 0) {
                            const remaining = popularProducts
                                .filter(p => !productsToShow.some(sp => sp.id === p.id))
                                .slice(0, 2 - productsToShow.length);
                            productsToShow.push(...remaining);
                        }
                        
                        return (
                            <CatalogEmptyState 
                                onClearFilters={handleClearAllFilters}
                                similarProducts={productsToShow.slice(0, 2)}
                                searchQuery={searchQuery || undefined}
                            />
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}

