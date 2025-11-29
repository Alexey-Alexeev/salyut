'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { CatalogCanonical } from '@/components/catalog/catalog-canonical';
import { useCatalogScrollRestore } from '@/hooks/use-catalog-scroll-restore';
import { useCatalogUrlSync } from '@/hooks/use-catalog-url-sync';
import { useCatalogFilters, FilterState } from '@/hooks/use-catalog-filters';
import { useCatalogProducts } from '@/hooks/use-catalog-products';
import { useCatalogFilterHandlers } from '@/hooks/use-catalog-filter-handlers';
import { useCatalogUI } from '@/hooks/use-catalog-ui';
import { useCatalogShotsStats } from '@/hooks/use-catalog-shots-stats';
import { useCatalogPagination } from '@/hooks/use-catalog-pagination';
import { Category, Product, InitialData, CatalogClientProps } from '@/types/catalog';
import { calculateShotsStats, isPetard } from '@/lib/catalog-utils';
import { generateCatalogStructuredData } from '@/lib/catalog-structured-data';
import { prepareEmptyStateProducts } from '@/lib/catalog-empty-state-utils';

export function CatalogClient({ initialData, searchParams }: CatalogClientProps) {
    // Основное состояние - инициализируем из server data
    const [categories] = useState<Category[]>(initialData.categories);

    // Вычисляем min/max значения залпов из всех товаров
    const initialShotsStats = calculateShotsStats(initialData.products);
    
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

    // Состояние интерфейса
    const [sortBy, setSortBy] = useState('popular');
    const [isInitializing, setIsInitializing] = useState(true);
    const [searchValue, setSearchValue] = useState('');
    const [priceFromValue, setPriceFromValue] = useState('');
    const [priceToValue, setPriceToValue] = useState('');
    const [shotsFromValue, setShotsFromValue] = useState('');
    const [shotsToValue, setShotsToValue] = useState('');

    // Хук для управления UI состоянием
    const {
        viewMode,
        setViewMode,
        isMobileFiltersOpen,
        setIsMobileFiltersOpen,
        isPaginationLoading,
        setIsPaginationLoading,
        isSearching,
        setIsSearching,
    } = useCatalogUI();
    
    // Ref для отслеживания, идет ли инициализация из URL (используется в обоих хуках)
    const isInitializingFromUrlRef = useRef(false);

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

    // Хук для управления статистикой залпов
    useCatalogShotsStats({
        allProducts,
        updateStats,
    });

    // Хук для обработчиков фильтров
    const {
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
        handleClearAllFilters: handleClearAllFiltersFromHook,
        clearAllTimeouts,
    } = useCatalogFilterHandlers({
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
    });

    // Обертка для handleClearAllFilters с дополнительной логикой
    const handleClearAllFilters = useCallback(() => {
        handleClearAllFiltersFromHook();
        resetRequestState();
    }, [handleClearAllFiltersFromHook, resetRequestState]);

    // Хук для управления пагинацией
    const { handlePageChange } = useCatalogPagination({
        filters,
        sortBy,
        pagination,
        setPagination,
        updateURL,
        clearScrollPosition,
        setIsPaginationLoading,
    });

    // Логика загрузки товаров при смене страницы и загрузка всех товаров теперь находится в useCatalogProducts

    // Очистка таймаутов при размонтировании
    useEffect(() => {
        return () => {
            clearAllTimeouts();
        };
    }, [clearAllTimeouts]);

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
                    __html: JSON.stringify(
                        generateCatalogStructuredData(filteredProducts, categories, pagination)
                    )
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
                    {!isFiltering && filteredProducts.length === 1 && isPetard(filteredProducts[0]) ? (
                        <SinglePetardProductLayout products={filteredProducts} />
                    ) : (
                        <ProductsGrid
                            products={filteredProducts}
                            viewMode={viewMode}
                            isLoading={isFiltering}
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
                    {filteredProducts.length === 0 && (
                        <CatalogEmptyState 
                            onClearFilters={handleClearAllFilters}
                            similarProducts={prepareEmptyStateProducts(
                                filters.search?.trim(),
                                allProducts,
                                popularProducts,
                                2
                            )}
                            searchQuery={filters.search?.trim() || undefined}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

