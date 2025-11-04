'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { findSimilarProducts } from '@/lib/similar-products';

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
    video_url?: string | null;
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

interface PromoPageClientProps {
    initialData: InitialData;
    preSelectedCategories: string[];
    preSortBy: string;
}

export function PromoPageClient({ initialData, preSelectedCategories, preSortBy }: PromoPageClientProps) {
    const router = useRouter();

    // Основное состояние - инициализируем из pre-rendered данных
    const [categories] = useState<Category[]>(initialData.categories);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialData.products);
    const [allProducts, setAllProducts] = useState<Product[]>(initialData.products);
    const [popularProducts, setPopularProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState(initialData.pagination);

    // Сохраняем исходные данные
    const initialPagination = useRef(initialData.pagination);
    const initialProducts = useRef(initialData.products);

    // Состояние фильтров - инициализируем с предустановленными категориями
    const [filters, setFilters] = useState<FilterState>({
        categories: preSelectedCategories,
        priceFrom: '',
        priceTo: '',
        priceMin: initialData.stats.minPrice,
        priceMax: initialData.stats.maxPrice,
        search: '',
    });

    // Состояние интерфейса
    const [sortBy, setSortBy] = useState(preSortBy);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [priceFromValue, setPriceFromValue] = useState('');
    const [priceToValue, setPriceToValue] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const priceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastPageRef = useRef(1);
    const isRequestInProgressRef = useRef(false);
    const lastRequestIdRef = useRef<string | null>(null);

    // Стабилизируем список товаров
    const stableProducts = useMemo(() => {
        return filteredProducts;
    }, [filteredProducts]);

    // Мемоизируем построение API параметров
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
    }, [sortBy, filters, categories]);

    const resetPage = useCallback(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // Применение всех фильтров через серверные запросы
    useEffect(() => {
        const applyAllFilters = async () => {
            // Не применяем фильтры при смене страницы
            if (pagination.page !== lastPageRef.current) {
                return;
            }

            // Если пользователь ничего не изменил - используем pre-rendered данные
            const hasChanges = filters.search.trim() ||
                filters.priceFrom ||
                filters.priceTo ||
                JSON.stringify(filters.categories.sort()) !== JSON.stringify(preSelectedCategories.sort()) ||
                sortBy !== preSortBy;

            if (!hasChanges) {
                setFilteredProducts(initialProducts.current);
                setPagination(initialPagination.current);
                return;
            }

            const requestParams = buildApiParams();

            // Если уже идет запрос с теми же параметрами, пропускаем
            if (isRequestInProgressRef.current && lastRequestIdRef.current === requestParams) {
                return;
            }

            isRequestInProgressRef.current = true;
            lastRequestIdRef.current = requestParams;
            setIsFiltering(true);

            try {
                const categoryIds = categories
                    .filter(cat => filters.categories.includes(cat.slug))
                    .map(cat => cat.id);

                const data = await fetchProducts({
                    search: filters.search.trim() || undefined,
                    categoryId: categoryIds.length > 0 ? categoryIds : undefined,
                    minPrice: filters.priceFrom ? Number(filters.priceFrom) : undefined,
                    maxPrice: filters.priceTo ? Number(filters.priceTo) : undefined,
                    sortBy: sortBy,
                    page: 1,
                    limit: 20,
                });

                setFilteredProducts(data.products || []);
                setPagination(data.pagination || pagination);
            } catch (error) {
                console.error('Error applying filters:', error);
            } finally {
                setIsFiltering(false);
                isRequestInProgressRef.current = false;
            }
        };

        applyAllFilters();
    }, [filters, sortBy, buildApiParams, preSelectedCategories, preSortBy]);

    // Загрузка всех товаров для поиска похожих
    useEffect(() => {
        let isMounted = true;

        const loadAllProducts = async () => {
            try {
                const data = await fetchProducts({
                    limit: 1000,
                    sortBy: 'name',
                });

                if (isMounted && data.products && data.products.length > 0) {
                    setAllProducts(data.products);

                    const popular = data.products
                        .filter(p => p.is_popular === true)
                        .sort(() => Math.random() - 0.5)
                        .slice(0, 3);

                    if (popular.length < 3) {
                        const remaining = data.products
                            .filter(p => !popular.some(pp => pp.id === p.id))
                            .sort(() => Math.random() - 0.5)
                            .slice(0, 3 - popular.length);
                        popular.push(...remaining);
                    }

                    setPopularProducts(popular.slice(0, 3));
                }
            } catch (error) {
                console.error('Error loading all products:', error);
                if (isMounted) {
                    setAllProducts(initialProducts.current);

                    const popular = initialProducts.current
                        .filter(p => p.is_popular === true)
                        .slice(0, 3);

                    if (popular.length < 3) {
                        const remaining = initialProducts.current
                            .filter(p => !popular.some(pp => pp.id === p.id))
                            .slice(0, 3 - popular.length);
                        popular.push(...remaining);
                    }

                    setPopularProducts(popular.slice(0, 3));
                }
            }
        };

        loadAllProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    // Обработчики событий
    const handleCategoryChange = useCallback(
        (categorySlug: string, checked: boolean) => {
            resetPage();
            const newCategories = checked
                ? [...filters.categories, categorySlug]
                : filters.categories.filter(slug => slug !== categorySlug);

            setFilters(prev => ({
                ...prev,
                categories: newCategories,
            }));
        },
        [resetPage, filters]
    );

    const handlePriceChange = useCallback((from: string, to: string) => {
        resetPage();
        setFilters(prev => ({
            ...prev,
            priceFrom: from,
            priceTo: to,
        }));
    }, [resetPage, filters]);

    const handleSortChange = useCallback((newSortBy: string) => {
        setSortBy(newSortBy);
    }, []);

    const handleRemoveCategory = useCallback((categorySlug: string) => {
        resetPage();
        const newCategories = filters.categories.filter(slug => slug !== categorySlug);
        setFilters(prev => ({
            ...prev,
            categories: newCategories,
        }));
    }, [resetPage, filters]);

    const handleClearPrice = useCallback(() => {
        resetPage();
        setFilters(prev => ({
            ...prev,
            priceFrom: '',
            priceTo: '',
        }));
    }, [resetPage]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchValue(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (value.trim() === '') {
            setIsSearching(false);
            resetPage();
            setFilters(prev => ({
                ...prev,
                search: '',
            }));
            return;
        }

        setIsSearching(true);

        searchTimeoutRef.current = setTimeout(() => {
            resetPage();
            setFilters(prev => ({
                ...prev,
                search: value,
            }));
            setIsSearching(false);
        }, 300);
    }, [resetPage]);

    const handlePriceFromChange = useCallback((value: string) => {
        setPriceFromValue(value);

        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        if (value.trim() === '') {
            resetPage();
            setFilters(prev => ({
                ...prev,
                priceFrom: '',
            }));
            return;
        }

        priceTimeoutRef.current = setTimeout(() => {
            resetPage();
            setFilters(prev => ({
                ...prev,
                priceFrom: value,
            }));
        }, 500);
    }, [resetPage]);

    const handlePriceToChange = useCallback((value: string) => {
        setPriceToValue(value);

        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        if (value.trim() === '') {
            resetPage();
            setFilters(prev => ({
                ...prev,
                priceTo: '',
            }));
            return;
        }

        priceTimeoutRef.current = setTimeout(() => {
            resetPage();
            setFilters(prev => ({
                ...prev,
                priceTo: value,
            }));
        }, 500);
    }, [resetPage]);

    const handleClearSearch = useCallback(() => {
        setSearchValue('');
        setIsSearching(false);
        resetPage();
        setFilters(prev => ({
            ...prev,
            search: '',
        }));

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
    }, [resetPage]);

    const handleClearAllFilters = useCallback(() => {
        setSearchValue('');
        setPriceFromValue('');
        setPriceToValue('');
        setIsSearching(false);
        resetPage();
        setSortBy(preSortBy);
        setFilters({
            categories: preSelectedCategories,
            priceFrom: '',
            priceTo: '',
            search: '',
            priceMin: initialData.stats.minPrice,
            priceMax: initialData.stats.maxPrice,
        });

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        isRequestInProgressRef.current = false;
        lastRequestIdRef.current = null;
    }, [resetPage, preSortBy, preSelectedCategories, initialData.stats]);

    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({
            ...prev,
            page,
        }));

        if (typeof window !== 'undefined' && window.innerWidth < 768) {
            setIsPaginationLoading(true);
        }

        if (typeof window !== 'undefined') {
            try {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch {
                window.scrollTo(0, 0);
            }
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
            isRequestInProgressRef.current = false;
            lastRequestIdRef.current = null;
        };
    }, []);

    // Preload первых изображений для ускорения LCP
    const firstProductImages = useMemo(() => {
        return filteredProducts
            .slice(0, 4) // Первые 4 товара видны сразу
            .map(p => p.images?.[0])
            .filter(Boolean) as string[];
    }, [filteredProducts]);

    return (
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-8 animate-in fade-in duration-300">
            {/* Preload и preconnect для критических ресурсов */}
            <link rel="preconnect" href="https://gqnwyyinswqoustiqtpk.supabase.co" />
            <link rel="dns-prefetch" href="https://gqnwyyinswqoustiqtpk.supabase.co" />
            
            {/* Preload критических изображений */}
            {firstProductImages.map((imageUrl, index) => (
                <link
                    key={imageUrl}
                    rel="preload"
                    as="image"
                    href={imageUrl}
                    // Первое изображение самое важное для LCP
                    fetchPriority={index === 0 ? 'high' : 'low'}
                />
            ))}
            
            {/* Canonical для предотвращения дублей */}
            <link rel="canonical" href="https://salutgrad.ru/catalog/promo/fireworks" />
            
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Фейерверки и веерные салюты - Специальное предложение",
                        "description": "Лучшие фейерверки и веерные салюты по выгодным ценам в Москве и МО",
                        "url": "https://salutgrad.ru/catalog/promo/fireworks",
                        "mainEntity": {
                            "@type": "ItemList",
                            "name": "Фейерверки и веерные салюты",
                            "numberOfItems": pagination.totalCount,
                            "itemListElement": filteredProducts.slice(0, 20).map((product, index) => ({
                                "@type": "Product",
                                "position": index + 1,
                                "name": product.name,
                                "description": product.short_description || `Качественный ${product.name}`,
                                "image": product.images?.[0] || "https://salutgrad.ru/images/product-placeholder.jpg",
                                "brand": {
                                    "@type": "Brand",
                                    "name": "СалютГрад"
                                },
                                "sku": product.id,
                                "url": `https://salutgrad.ru/product/${product.slug}`,
                                "offers": {
                                    "@type": "Offer",
                                    "price": product.price,
                                    "priceCurrency": "RUB",
                                    "priceValidUntil": PRICE_VALID_UNTIL,
                                    "availability": "https://schema.org/InStock",
                                }
                            }))
                        }
                    })
                }}
            />

            {/* Breadcrumb */}
            <div className="mb-6">
                <Breadcrumb items={[
                    { label: 'Каталог товаров', href: '/catalog/' },
                    { label: 'Фейерверки и веерные салюты' }
                ]} />
            </div>

            {/* Заголовок промо страницы */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Фейерверки и веерные салюты</h1>
                <p className="text-muted-foreground">Специальная подборка лучших фейерверков и веерных салютов по выгодным ценам</p>
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

                    {/* Loader для пагинации */}
                    {isPaginationLoading && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm md:hidden">
                            <div className="flex flex-col items-center gap-4">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600"></div>
                                <p className="text-sm font-medium text-gray-700">Загружаем товары...</p>
                            </div>
                        </div>
                    )}

                    {/* Пустые результаты */}
                    {filteredProducts.length === 0 && (() => {
                        const searchQuery = filters.search?.trim();
                        const similarProducts = searchQuery && allProducts.length > 0
                            ? findSimilarProducts(searchQuery, allProducts, 2)
                            : [];

                        const productsToShow = [...similarProducts];

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

