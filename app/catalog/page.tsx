'use client';

import React, { useState, useEffect, Suspense, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Основное состояние
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const isLoadingRef = useRef(false);
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
  const [isFiltering, setIsFiltering] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPageRef = useRef(1);
  const prevSortByRef = useRef(sortBy);
  const isInitializedRef = useRef(false);
  const urlFiltersAppliedRef = useRef(false);
  const pageSetFromUrlRef = useRef(false);

  // Функция для обновления URL
  const updateURL = useCallback((params: {
    categories?: string[];
    priceFrom?: string;
    priceTo?: string;
    search?: string;
    sortBy?: string;
    page?: number;
  }) => {
    console.log('🔍 [NAVIGATION] updateURL called with:', params);
    console.log('🔍 [NAVIGATION] Current URL:', window.location.href);
    console.log('🔍 [NAVIGATION] History length:', window.history.length);

    // Используем функцию для получения актуальных searchParams вместо зависимости
    const currentParams = new URLSearchParams(window.location.search);

    // Проверяем, есть ли предыдущая запись в истории браузера
    // Если есть - используем push, если нет - используем replace
    const hasHistory = window.history.length > 1;

    // Категории
    if (params.categories !== undefined) {
      currentParams.delete('category');
      if (params.categories.length > 0) {
        params.categories.forEach(cat => currentParams.append('category', cat));
      }
    }

    // Цена
    if (params.priceFrom !== undefined) {
      if (params.priceFrom) {
        currentParams.set('priceFrom', params.priceFrom);
      } else {
        currentParams.delete('priceFrom');
      }
    }
    if (params.priceTo !== undefined) {
      if (params.priceTo) {
        currentParams.set('priceTo', params.priceTo);
      } else {
        currentParams.delete('priceTo');
      }
    }

    // Поиск
    if (params.search !== undefined) {
      if (params.search) {
        currentParams.set('search', params.search);
      } else {
        currentParams.delete('search');
      }
    }

    // Сортировка (только если не по умолчанию)
    if (params.sortBy !== undefined) {
      if (params.sortBy && params.sortBy !== 'name') {
        currentParams.set('sort', params.sortBy);
      } else {
        currentParams.delete('sort');
      }
    }

    // Страница (только если не первая)
    if (params.page !== undefined) {
      if (params.page > 1) {
        currentParams.set('page', params.page.toString());
      } else {
        currentParams.delete('page');
      }
    }

    // Обновляем URL без перезагрузки страницы
    // ВСЕГДА добавляем номер страницы в URL, даже для страницы 1
    const newUrl = currentParams.toString() ? `${pathname}?${currentParams.toString()}` : `${pathname}?page=1`;

    console.log('🔍 [NAVIGATION] New URL will be:', newUrl);
    console.log('🔍 [NAVIGATION] Has history:', hasHistory);
    console.log('🔍 [NAVIGATION] Using method:', hasHistory ? 'push' : 'replace');

    if (hasHistory) {
      // Если есть история - добавляем новую запись
      router.push(newUrl, { scroll: false });
    } else {
      // Если нет истории - заменяем текущую запись
      router.replace(newUrl, { scroll: false });
    }
  }, [pathname, router]);

  // Стабилизируем список товаров для предотвращения лишних рендеров
  const stableProducts = useMemo(() => {
    return filteredProducts;
  }, [filteredProducts.length, filteredProducts.map(p => p.id).join(',')]);

  // Загрузка данных
  useEffect(() => {
    if (hasLoaded || isLoadingRef.current) {
      return; // Предотвращаем повторную загрузку
    }

    isLoadingRef.current = true;

    const fetchData = async () => {
      try {
        // Проверяем, есть ли параметры в URL
        const pageFromUrl = searchParams.get('page');
        const categoryFromUrl = searchParams.get('category');
        const initialPage = pageFromUrl ? parseInt(pageFromUrl, 10) : 1;

        // Если есть параметры в URL, загружаем данные с фильтрами сразу
        if (searchParams.toString().length > 0) {
          console.log('🔍 [CATALOG] Initial data fetch with URL params - skipping, will be handled by applyFiltersFromUrl');
          const [categoriesRes, statsRes] = await Promise.all([
            fetch('/api/categories'),
            fetch('/api/products/stats'),
          ]);

          if (categoriesRes.ok && statsRes.ok) {
            const [categoriesData, statsData] = await Promise.all([
              categoriesRes.json(),
              statsRes.json(),
            ]);

            setCategories(categoriesData);
            setFilters(prev => ({
              ...prev,
              priceMin: statsData.minPrice || 0,
              priceMax: statsData.maxPrice || 10000,
            }));
            setHasLoaded(true);
          }
          return;
        }

        console.log('🔍 [CATALOG] Initial data fetch with page:', initialPage);

        const [categoriesRes, productsRes, statsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch(`/api/products?limit=20&page=${initialPage}`), // Используем страницу из URL
          fetch('/api/products/stats'), // Получаем статистику для фильтров
        ]);

        if (categoriesRes.ok && productsRes.ok && statsRes.ok) {
          const [categoriesData, productsResponse, statsData] = await Promise.all([
            categoriesRes.json(),
            productsRes.json(),
            statsRes.json(),
          ]);

          // Обновляем все состояние одновременно, чтобы избежать промежуточных рендеров
          setCategories(categoriesData);
          setProducts(productsResponse.products || []);
          setFilteredProducts(productsResponse.products || []);
          setFilters(prev => ({
            ...prev,
            priceMin: statsData.minPrice || 0,
            priceMax: statsData.maxPrice || 10000,
          }));

          if (productsResponse.pagination) {
            // Устанавливаем правильную страницу из URL
            setPagination({
              ...productsResponse.pagination,
              page: initialPage
            });
            lastPageRef.current = initialPage;
            console.log('🔍 [CATALOG] Initial pagination set to page:', initialPage);
          }

          setHasLoaded(true);
        }
      } catch (error) {
        console.error('❌ [CATALOG] Ошибка загрузки данных:', error);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    fetchData();
  }, [hasLoaded]);

  // Инициализация фильтров из URL (только один раз при монтировании)
  useEffect(() => {
    console.log('🔍 [URL_CHANGE] URL changed to:', searchParams.toString());
    console.log('🔍 [URL_CHANGE] Is initialized:', isInitializedRef.current);
    console.log('🔍 [URL_CHANGE] Current page from URL:', searchParams.get('page'));
    console.log('🔍 [URL_CHANGE] Current pagination page:', pagination.page);

    if (!isInitializedRef.current) {
      isInitializedRef.current = true;

      const categoryParams = searchParams.getAll('category');
      const searchParam = searchParams.get('search');
      const priceFromParam = searchParams.get('priceFrom');
      const priceToParam = searchParams.get('priceTo');
      const sortParam = searchParams.get('sort');
      const pageParam = searchParams.get('page');

      // Обновляем фильтры из URL
      setFilters(prev => ({
        ...prev,
        categories: categoryParams.length > 0 ? categoryParams : [],
        search: searchParam || '',
        priceFrom: priceFromParam || '',
        priceTo: priceToParam || '',
      }));

      // Устанавливаем значение поиска в поле ввода
      if (searchParam) {
        setSearchValue(searchParam);
      }

      // Устанавливаем сортировку
      if (sortParam) {
        setSortBy(sortParam);
        prevSortByRef.current = sortParam;
      }

      // Устанавливаем страницу (отложенно, после загрузки данных)
      if (pageParam && !pageSetFromUrlRef.current) {
        const page = parseInt(pageParam, 10);
        if (!isNaN(page) && page > 0) {
          pageSetFromUrlRef.current = true;
          // НЕ устанавливаем страницу сразу, ждем загрузки данных
          lastPageRef.current = page;
        }
      }
    } else {
      // Если уже инициализирован, но URL изменился - обрабатываем изменение
      console.log('🔍 [URL_CHANGE] URL changed after initialization, processing...');

      const pageFromUrl = searchParams.get('page');
      const currentPage = pageFromUrl ? parseInt(pageFromUrl, 10) : 1;

      // Если в URL нет страницы, но есть другие параметры, добавляем page=1
      if (!pageFromUrl && searchParams.toString().length > 0) {
        console.log('🔍 [URL_CHANGE] No page in URL, adding page=1');
        updateURL({ page: 1 });
        return;
      }

      console.log('🔍 [URL_CHANGE] Page from URL:', pageFromUrl, 'Current page:', currentPage);
      console.log('🔍 [URL_CHANGE] Current pagination page:', pagination.page);

      // Если страница изменилась, обновляем пагинацию
      if (currentPage !== pagination.page) {
        console.log('🔍 [URL_CHANGE] Page changed, updating pagination from', pagination.page, 'to', currentPage);
        setPagination(prev => ({
          ...prev,
          page: currentPage
        }));
        lastPageRef.current = currentPage;

        // Сбрасываем флаг применения фильтров из URL, чтобы применить новые фильтры
        urlFiltersAppliedRef.current = false;
      }
    }
  }, [searchParams]);

  // Принудительное применение фильтров при инициализации из URL
  useEffect(() => {
    // Если есть параметры в URL и данные загружены, но фильтры еще не применялись
    const hasUrlParams = searchParams.toString().length > 0;

    if (hasUrlParams && hasLoaded && !isFiltering && !urlFiltersAppliedRef.current) {
      urlFiltersAppliedRef.current = true;

      // Небольшая задержка чтобы setPagination успел обновиться
      setTimeout(() => {
        // Принудительно запускаем применение фильтров
        const applyFiltersFromUrl = async () => {
          // Устанавливаем страницу из URL перед применением фильтров
          const pageFromUrl = searchParams.get('page');
          const currentPage = pageFromUrl ? parseInt(pageFromUrl, 10) : 1;
          if (currentPage > 1) {
            setPagination(prev => ({
              ...prev,
              page: currentPage
            }));
            lastPageRef.current = currentPage;
          }

          setIsFiltering(true);

          try {
            const params = new URLSearchParams();
            // Используем страницу из URL, а не из состояния
            const pageFromUrl = searchParams.get('page');
            const currentPage = pageFromUrl ? parseInt(pageFromUrl, 10) : 1;
            params.set('page', currentPage.toString());
            params.set('limit', '20');
            params.set('sortBy', sortBy);

            // Добавляем поиск
            if (filters.search.trim()) {
              params.set('search', filters.search.trim());
            }

            // Добавляем фильтр по категориям
            if (filters.categories.length > 0) {
              const categoryIds = categories
                .filter(cat => filters.categories.includes(cat.slug))
                .map(cat => cat.id);

              if (categoryIds.length > 0) {
                params.set('categoryId', categoryIds[0]);
              }
            }

            // Добавляем фильтр по цене
            if (filters.priceFrom) {
              params.set('minPrice', filters.priceFrom);
            }
            if (filters.priceTo) {
              params.set('maxPrice', filters.priceTo);
            }

            const response = await fetch(`/api/products?${params.toString()}`);

            if (response.ok) {
              const data = await response.json();
              setFilteredProducts(data.products || []);
              // Сохраняем правильную страницу из URL, а не перезаписываем из API
              if (data.pagination) {
                setPagination({
                  ...data.pagination,
                  page: currentPage // Используем страницу из URL
                });
                lastPageRef.current = currentPage; // Обновляем ref для предотвращения конфликтов
              }
            } else {
              console.error('❌ [CATALOG] API response not ok:', response.status, response.statusText);
            }
          } catch (error) {
            console.error('❌ [CATALOG] Error applying filters from URL:', error);
          } finally {
            setIsFiltering(false);
          }
        };

        applyFiltersFromUrl();
      }, 100); // 100ms задержка
    }
  }, [hasLoaded, searchParams, filters, categories, sortBy, isFiltering]);

  // Применение всех фильтров через серверные запросы
  useEffect(() => {
    console.log('🔍 [CATALOG] Main filter useEffect check:', {
      hasLoaded,
      paginationPage: pagination.page,
      lastPageRef: lastPageRef.current,
      urlFiltersApplied: urlFiltersAppliedRef.current,
      hasUrlParams: searchParams.toString().length > 0,
      shouldRun: hasLoaded && pagination.page === lastPageRef.current && !(urlFiltersAppliedRef.current && searchParams.toString().length > 0),
      searchParams: searchParams.toString()
    });

    const applyAllFilters = async () => {
      // Не применяем фильтры, если данные еще не готовы
      if (!hasLoaded) {
        console.log('🔍 [CATALOG] Main filter useEffect - data not loaded yet');
        return;
      }

      // Не применяем фильтры при смене страницы (это делает отдельный useEffect)
      if (pagination.page !== lastPageRef.current) {
        console.log('🔍 [CATALOG] Main filter useEffect - page change detected, skipping');
        return;
      }

      // Не применяем фильтры, если они уже применены из URL
      if (urlFiltersAppliedRef.current && searchParams.toString().length > 0) {
        console.log('🔍 [CATALOG] Skipping main filter application - already applied from URL');
        return;
      }

      // НЕ применяем фильтры, если есть параметры в URL (ждем инициализации из URL)
      if (searchParams.toString().length > 0 && !urlFiltersAppliedRef.current) {
        console.log('🔍 [CATALOG] Skipping main filter application - waiting for URL initialization');
        return;
      }

      console.log('🔍 [CATALOG] Main filter useEffect - applying filters');
      setIsFiltering(true);

      try {
        // Строим URL с параметрами фильтрации
        const params = new URLSearchParams();
        params.set('page', pagination.page.toString());
        params.set('limit', '20');
        params.set('sortBy', sortBy);

        // Добавляем поиск
        if (filters.search.trim()) {
          params.set('search', filters.search.trim());
        }

        // Добавляем фильтр по категориям
        if (filters.categories.length > 0) {
          const categoryIds = categories
            .filter(cat => filters.categories.includes(cat.slug))
            .map(cat => cat.id);
          if (categoryIds.length > 0) {
            params.set('categoryId', categoryIds[0]); // Пока поддерживаем одну категорию
          }
        }

        // Добавляем фильтр по цене
        if (filters.priceFrom) {
          params.set('minPrice', filters.priceFrom);
        }
        if (filters.priceTo) {
          params.set('maxPrice', filters.priceTo);
        }

        const response = await fetch(`/api/products?${params.toString()}`);

        if (response.ok) {
          const data = await response.json();
          setFilteredProducts(data.products || []);
          setPagination(data.pagination || pagination);
        }
      } catch (error) {
        console.error('Error applying filters:', error);
      } finally {
        setIsFiltering(false);
      }
    };

    // Применяем фильтры только если данные готовы
    if (hasLoaded) {
      applyAllFilters();
    }
  }, [filters, sortBy, hasLoaded, categories]); // Убрали pagination.page из зависимостей

  // Обработчики событий
  const handleCategoryChange = useCallback(
    (categorySlug: string, checked: boolean) => {
      const newCategories = checked
        ? [...filters.categories, categorySlug]
        : filters.categories.filter(slug => slug !== categorySlug);

      // Сбрасываем страницу на 1 при изменении категории
      setPagination(prev => ({
        ...prev,
        page: 1,
      }));

      setFilters(prev => ({
        ...prev,
        categories: newCategories,
      }));

      // Обновляем URL
      updateURL({
        categories: newCategories,
        page: 1,
      });
    },
    [filters.categories, updateURL]
  );

  const handlePriceChange = useCallback((from: string, to: string) => {
    // Сбрасываем страницу на 1 при изменении цены
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));

    setFilters(prev => ({
      ...prev,
      priceFrom: from,
      priceTo: to,
    }));

    // Обновляем URL
    updateURL({
      priceFrom: from,
      priceTo: to,
      page: 1,
    });
  }, [updateURL]);

  const handleRemoveCategory = useCallback((categorySlug: string) => {
    const newCategories = filters.categories.filter(slug => slug !== categorySlug);

    // Сбрасываем страницу на 1 при удалении категории
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));

    setFilters(prev => ({
      ...prev,
      categories: newCategories,
    }));

    // Обновляем URL
    updateURL({
      categories: newCategories,
      page: 1,
    });
  }, [filters.categories, updateURL]);

  const handleClearPrice = useCallback(() => {
    // Сбрасываем страницу на 1 при очистке цены
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));

    setFilters(prev => ({
      ...prev,
      priceFrom: '',
      priceTo: '',
    }));

    // Обновляем URL
    updateURL({
      priceFrom: '',
      priceTo: '',
      page: 1,
    });
  }, [updateURL]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);

    // Очищаем предыдущий таймаут
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Устанавливаем новый таймаут для debouncing
    searchTimeoutRef.current = setTimeout(() => {
      console.log('🔍 [SEARCH] Search changed to:', value);

      // Сбрасываем страницу на 1 при поиске
      setPagination(prev => ({
        ...prev,
        page: 1,
      }));

      // Принудительно обновляем lastPageRef для предотвращения конфликтов
      lastPageRef.current = 1;

      setFilters(prev => ({
        ...prev,
        search: value,
      }));

      // Сбрасываем флаг применения фильтров, чтобы применить новые фильтры
      urlFiltersAppliedRef.current = false;

      // Обновляем URL
      updateURL({
        search: value,
        page: 1,
      });

      // Дополнительная задержка для синхронизации состояния
      setTimeout(() => {
        console.log('🔍 [SEARCH] Final state check - pagination.page:', pagination.page, 'lastPageRef:', lastPageRef.current);
        if (pagination.page > 1) {
          console.log('🔍 [SEARCH] Forcing page reset to 1');
          setPagination(prev => ({
            ...prev,
            page: 1,
          }));
          lastPageRef.current = 1;
        }
      }, 100);
    }, 500); // 500ms задержка
  }, [updateURL]);

  const handleClearSearch = useCallback(() => {
    console.log('🔍 [SEARCH] Clearing search');
    setSearchValue('');

    // Сбрасываем страницу на 1 при очистке поиска
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));

    // Принудительно обновляем lastPageRef для предотвращения конфликтов
    lastPageRef.current = 1;

    setFilters(prev => ({
      ...prev,
      search: '',
    }));

    // Сбрасываем флаг применения фильтров, чтобы применить новые фильтры
    urlFiltersAppliedRef.current = false;

    // Обновляем URL
    updateURL({
      search: '',
      page: 1,
    });

    // Очищаем таймаут
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, [updateURL]);

  const handleClearAllFilters = useCallback(() => {
    console.log('🔍 [FILTERS] Clearing all filters');
    setSearchValue('');

    // Сбрасываем страницу на 1 при очистке всех фильтров
    setPagination(prev => ({
      ...prev,
      page: 1,
    }));

    // Принудительно обновляем lastPageRef для предотвращения конфликтов
    lastPageRef.current = 1;

    setFilters(prev => ({
      ...prev,
      categories: [],
      priceFrom: '',
      priceTo: '',
      search: '',
    }));

    // Сбрасываем флаг применения фильтров, чтобы применить новые фильтры
    urlFiltersAppliedRef.current = false;

    // Обновляем URL (сбрасываем все параметры)
    updateURL({
      categories: [],
      priceFrom: '',
      priceTo: '',
      search: '',
      page: 1,
    });

    // Очищаем таймаут
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, [updateURL]);

  const handlePageChange = useCallback((page: number) => {
    console.log('🔍 [CATALOG] handlePageChange called with page:', page);
    setPagination(prev => {
      console.log('🔍 [CATALOG] setPagination called:', { prev, newPage: page });
      return {
        ...prev,
        page,
      };
    });

    // Обновляем URL
    updateURL({
      page,
    });
  }, [updateURL]);

  // Обновление URL при изменении сортировки
  useEffect(() => {
    // Проверяем, действительно ли изменилась сортировка
    // НЕ срабатываем при инициализации из URL
    console.log('🔍 [CATALOG] Sort useEffect check:', {
      hasLoaded,
      prevSortBy: prevSortByRef.current,
      currentSortBy: sortBy,
      urlFiltersApplied: urlFiltersAppliedRef.current,
      shouldRun: hasLoaded && prevSortByRef.current !== sortBy && !urlFiltersAppliedRef.current
    });

    if (hasLoaded && prevSortByRef.current !== sortBy && !urlFiltersAppliedRef.current) {
      console.log('🔍 [CATALOG] Sort useEffect triggered - resetting page to 1');
      prevSortByRef.current = sortBy;

      // Сбрасываем страницу на 1 при изменении сортировки
      setPagination(prev => {
        if (prev.page > 1) {
          return {
            ...prev,
            page: 1,
          };
        }
        return prev;
      });

      // Обновляем URL
      updateURL({
        sortBy,
        page: 1,
      });
    }
  }, [sortBy, hasLoaded, updateURL]);

  // Отдельный useEffect для смены страницы
  useEffect(() => {
    console.log('🔍 [CATALOG] Page change useEffect check:', {
      hasLoaded,
      paginationPage: pagination.page,
      lastPageRef: lastPageRef.current,
      shouldRun: hasLoaded && pagination.page !== lastPageRef.current,
      hasSearch: filters.search.trim().length > 0
    });

    // НЕ применяем смену страницы, если есть поиск (поиск всегда начинается со страницы 1)
    if (filters.search.trim().length > 0) {
      console.log('🔍 [CATALOG] Page change useEffect - skipping due to active search');
      // Принудительно обновляем lastPageRef, чтобы избежать конфликтов
      lastPageRef.current = pagination.page;
      return;
    }

    // Дополнительная проверка: если есть поиск в URL, но pagination.page > 1, сбрасываем на 1
    if (searchParams.get('search') && pagination.page > 1) {
      console.log('🔍 [CATALOG] Page change useEffect - resetting page to 1 due to search in URL');
      setPagination(prev => ({
        ...prev,
        page: 1
      }));
      lastPageRef.current = 1;
      return;
    }

    // Еще одна проверка: если есть поиск в фильтрах, но pagination.page > 1, сбрасываем на 1
    if (filters.search.trim().length > 0 && pagination.page > 1) {
      console.log('🔍 [CATALOG] Page change useEffect - resetting page to 1 due to search in filters');
      setPagination(prev => ({
        ...prev,
        page: 1
      }));
      lastPageRef.current = 1;
      return;
    }

    if (hasLoaded && pagination.page !== lastPageRef.current) {
      console.log('🔍 [CATALOG] Page change useEffect triggered - fetching page:', pagination.page);
      const fetchPage = async () => {
        setIsFiltering(true);

        try {
          const params = new URLSearchParams();
          params.set('page', pagination.page.toString());
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
              params.set('categoryId', categoryIds[0]);
            }
          }

          if (filters.priceFrom) {
            params.set('minPrice', filters.priceFrom);
          }
          if (filters.priceTo) {
            params.set('maxPrice', filters.priceTo);
          }

          const response = await fetch(`/api/products?${params.toString()}`);

          if (response.ok) {
            const data = await response.json();
            setFilteredProducts(data.products || []);
            setPagination(data.pagination || pagination);
          }
        } catch (error) {
          console.error('Error fetching page:', error);
        } finally {
          setIsFiltering(false);
        }
      };

      fetchPage();
      lastPageRef.current = pagination.page;
    }
  }, [pagination.page, filters.search, searchParams]); // При изменении страницы, поиска или URL

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
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
        <div className="relative w-full lg:w-64">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Поиск по названию товара..."
            value={searchValue}
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

          {/* Пагинация сверху */}
          {filteredProducts.length > 0 && pagination.totalPages > 1 && (
            <div className="mb-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Страница {pagination.page} из {pagination.totalPages}
                  {pagination.totalCount > 0 && (
                    <span className="ml-2">
                      ({pagination.totalCount} товаров)
                    </span>
                  )}
                </div>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}

          {/* Сетка товаров */}
          <div
            className={`grid gap-4 ${viewMode === 'grid'
              ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
              }`}
            style={{ gridAutoRows: '1fr' }}
          >
            {loading || isFiltering ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-muted aspect-square rounded-lg mb-2" />
                  <div className="bg-muted h-4 rounded mb-2" />
                  <div className="bg-muted h-6 w-1/2 rounded" />
                </div>
              ))
            ) : (
              stableProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          {/* Пагинация снизу */}
          {filteredProducts.length > 0 && pagination.totalPages > 1 && (
            <div className="mt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  Страница {pagination.page} из {pagination.totalPages}
                </div>
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPrevPage={pagination.hasPrevPage}
                  onPageChange={handlePageChange}
                />
              </div>
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
