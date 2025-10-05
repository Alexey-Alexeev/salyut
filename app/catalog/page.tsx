'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Grid, List, Search, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { PriceRangeFilter } from '@/components/catalog/price-range-filter';
import { CategoryFilter } from '@/components/catalog/category-filter';
import { ActiveFilters } from '@/components/catalog/active-filters';
import { Pagination } from '@/components/catalog/pagination';

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
}

interface FilterState {
  categories: string[];
  priceFrom: string;
  priceTo: string;
  priceMin: number;
  priceMax: number;
  search: string;
}

function CatalogContent() {
  const searchParams = useSearchParams();

  // Основное состояние
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Состояние фильтров
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceFrom: '',
    priceTo: '',
    priceMin: 0,
    priceMax: 10000,
    search: '',
  });

  // Состояние интерфейса
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products?limit=1000'), // Загружаем больше товаров для фильтров
        ]);

        if (categoriesRes.ok && productsRes.ok) {
          const [categoriesData, productsResponse] = await Promise.all([
            categoriesRes.json(),
            productsRes.json(),
          ]);

          setCategories(categoriesData);

          // Если API вернул пагинированные данные
          if (productsResponse.products) {
            setProducts(productsResponse.products);
            setPagination(productsResponse.pagination);
          } else {
            // Fallback для старого формата API
            setProducts(productsResponse);
          }

          // Определяем диапазон цен
          const allProducts = productsResponse.products || productsResponse;
          const prices = allProducts.map((p: Product) => p.price);
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

          setFilters(prev => ({
            ...prev,
            priceMax: maxPrice,
          }));

          setFilteredProducts(allProducts);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Инициализация фильтров из URL
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    if (categoryParam || searchParam) {
      setFilters(prev => ({
        ...prev,
        categories: categoryParam ? [categoryParam] : prev.categories,
        search: searchParam || '',
      }));
    }
  }, [searchParams]);

  // Применение всех фильтров (поиск + категории + цена + сортировка)
  useEffect(() => {
    const applyAllFilters = async () => {
      let productsToFilter = [...products];

      // Поиск по названию - делаем запрос к API с пагинацией
      if (filters.search.trim()) {
        try {
          const response = await fetch(
            `/api/products?search=${encodeURIComponent(filters.search)}&limit=1000`
          );
          if (response.ok) {
            const searchResponse = await response.json();
            productsToFilter = searchResponse.products || searchResponse;
            setPagination(searchResponse.pagination || pagination);
          }
        } catch (error) {
          console.error('Error searching products:', error);
        }
      }

      // Фильтр по категориям
      if (filters.categories.length > 0) {
        const categoryIds = categories
          .filter(cat => filters.categories.includes(cat.slug))
          .map(cat => cat.id);
        productsToFilter = productsToFilter.filter(product =>
          categoryIds.includes(product.category_id || '')
        );
      }

      // Фильтр по цене
      const minPrice = filters.priceFrom
        ? parseInt(filters.priceFrom)
        : filters.priceMin;
      const maxPrice = filters.priceTo
        ? parseInt(filters.priceTo)
        : filters.priceMax;

      productsToFilter = productsToFilter.filter(
        product => product.price >= minPrice && product.price <= maxPrice
      );

      // Сортировка
      productsToFilter.sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':
            return a.price - b.price;
          case 'price-desc':
            return b.price - a.price;
          case 'popular':
            return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0);
          default:
            return a.name.localeCompare(b.name, 'ru');
        }
      });

      setFilteredProducts(productsToFilter);
    };

    const timeoutId = setTimeout(applyAllFilters, 300); // debounce 300ms
    return () => clearTimeout(timeoutId);
  }, [products, categories, filters, sortBy, pagination]);

  // Обработчики событий
  const handleCategoryChange = useCallback(
    (categorySlug: string, checked: boolean) => {
      setFilters(prev => ({
        ...prev,
        categories: checked
          ? [...prev.categories, categorySlug]
          : prev.categories.filter(slug => slug !== categorySlug),
      }));
    },
    []
  );

  const handlePriceChange = useCallback((from: string, to: string) => {
    setFilters(prev => ({
      ...prev,
      priceFrom: from,
      priceTo: to,
    }));
  }, []);

  const handleRemoveCategory = useCallback((categorySlug: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.filter(slug => slug !== categorySlug),
    }));
  }, []);

  const handleClearPrice = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      priceFrom: '',
      priceTo: '',
    }));
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value,
    }));
  }, []);

  const handleClearSearch = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      search: '',
    }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      categories: [],
      priceFrom: '',
      priceTo: '',
      search: '',
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      page,
    }));
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="mb-6">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-100"></div>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Filters Skeleton */}
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="rounded-lg border p-6">
              <div className="mb-4 h-6 w-20 animate-pulse rounded bg-gray-100"></div>
              <div className="space-y-3">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100"></div>
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100"></div>
                <div className="h-4 w-28 animate-pulse rounded bg-gray-100"></div>
                <div className="h-4 w-36 animate-pulse rounded bg-gray-100"></div>
              </div>
              <div className="mt-6">
                <div className="mb-2 h-4 w-16 animate-pulse rounded bg-gray-100"></div>
                <div className="flex gap-2">
                  <div className="h-9 flex-1 animate-pulse rounded bg-gray-100"></div>
                  <div className="h-9 flex-1 animate-pulse rounded bg-gray-100"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="flex-1">
            {/* Mobile Controls Skeleton */}
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <div className="h-9 w-20 animate-pulse rounded bg-gray-100"></div>
              <div className="flex gap-1">
                <div className="size-9 animate-pulse rounded bg-gray-100"></div>
                <div className="size-9 animate-pulse rounded bg-gray-100"></div>
              </div>
            </div>

            {/* Desktop Controls Skeleton */}
            <div className="mb-6 hidden items-center justify-between lg:flex">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100"></div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="size-9 animate-pulse rounded bg-gray-100"></div>
                  <div className="size-9 animate-pulse rounded bg-gray-100"></div>
                </div>
                <div className="h-9 w-44 animate-pulse rounded bg-gray-100"></div>
              </div>
            </div>

            {/* Products Grid Skeleton */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border">
                  <div className="aspect-square animate-pulse bg-gray-100"></div>
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100"></div>
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100"></div>
                    <div className="h-8 w-full animate-pulse rounded bg-gray-100"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const FiltersContent = ({
    onMobileClose,
  }: {
    onMobileClose?: () => void;
  }) => (
    <div className="space-y-6">
      <CategoryFilter
        categories={categories}
        selectedCategories={filters.categories}
        onCategoryChange={handleCategoryChange}
      />

      <PriceRangeFilter
        priceFrom={filters.priceFrom}
        priceTo={filters.priceTo}
        minPrice={filters.priceMin}
        maxPrice={filters.priceMax}
        onPriceChange={handlePriceChange}
        onMobileFilterClose={onMobileClose}
      />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={[{ label: 'Каталог товаров' }]} />
      </div>

      {/* Поиск */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по названию товара..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Фильтры для десктопа */}
        <div className="hidden w-64 shrink-0 lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="size-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FiltersContent />
            </CardContent>
          </Card>
        </div>

        {/* Основной контент */}
        <div className="flex-1">
          {/* Мобильные фильтры и управление */}
          <div className="mb-6 flex flex-col gap-4">
            {/* Мобильные фильтры */}
            <div className="flex items-center justify-between lg:hidden">
              <Sheet
                open={isMobileFiltersOpen}
                onOpenChange={setIsMobileFiltersOpen}
              >
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 size-4" />
                    Фильтры
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Фильтры</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent
                      onMobileClose={() => setIsMobileFiltersOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="size-9 p-0"
                >
                  <Grid className="size-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="size-9 p-0"
                >
                  <List className="size-4" />
                </Button>
              </div>
            </div>

            {/* Управление для десктопа */}
            <div className="hidden items-center justify-between lg:flex">
              <span className="text-muted-foreground text-sm">
                Найдено: {filteredProducts.length}{' '}
                {filteredProducts.length === 1 ? 'товар' : 'товаров'}
              </span>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="size-9 p-0"
                  >
                    <Grid className="size-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="size-9 p-0"
                  >
                    <List className="size-4" />
                  </Button>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 w-44">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">По названию</SelectItem>
                    <SelectItem value="price-asc">Сначала дешёвые</SelectItem>
                    <SelectItem value="price-desc">Сначала дорогие</SelectItem>
                    <SelectItem value="popular">Популярные</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Счетчик и сортировка для мобильных */}
            <div className="flex items-center justify-between lg:hidden">
              <span className="text-muted-foreground text-sm">
                Найдено: {filteredProducts.length}
              </span>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-9 w-36">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="price-asc">Дешёвые</SelectItem>
                  <SelectItem value="price-desc">Дорогие</SelectItem>
                  <SelectItem value="popular">Популярные</SelectItem>
                </SelectContent>
              </Select>
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

          {/* Сетка товаров */}
          <div
            className={`grid gap-4 ${viewMode === 'grid'
              ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
              }`}
            style={{ gridAutoRows: '1fr' }}
          >
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Пагинация */}
          {filteredProducts.length > 0 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}

          {/* Сообщение о пустых результатах */}
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                По выбранным фильтрам ничего не найдено
              </p>
              <Button variant="outline" onClick={handleClearAllFilters}>
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Экспорт страницы с Suspense
export default function CatalogPage() {
  return (
    <Suspense
      fallback={<div className="container mx-auto px-4 py-8">Загрузка...</div>}
    >
      <CatalogContent />
    </Suspense>
  );
}
