import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchProducts } from '@/lib/api-client';
import { FilterState } from './use-catalog-filters';
import { Category, Product, Pagination } from '@/types/catalog';
import { buildApiParams as buildApiParamsUtil } from '@/lib/catalog-utils';

interface InitialData {
    products: Product[];
    pagination: Pagination;
}

interface UseCatalogProductsProps {
    filters: FilterState;
    sortBy: string;
    categories: Category[];
    initialData: InitialData;
    isInitializingFromUrlRef: React.MutableRefObject<boolean>;
    setIsInitializing: (value: boolean) => void;
    setIsPaginationLoading?: (value: boolean) => void;
}

/**
 * Хук для управления загрузкой и состоянием товаров каталога
 * Обрабатывает загрузку при применении фильтров, смене страницы и загрузку всех товаров
 */
export function useCatalogProducts({
    filters,
    sortBy,
    categories,
    initialData,
    isInitializingFromUrlRef,
    setIsInitializing,
    setIsPaginationLoading,
}: UseCatalogProductsProps) {
    // Мемоизируем функцию построения параметров API
    const buildApiParams = useCallback(
        (page: number = 1) => buildApiParamsUtil(filters, sortBy, categories, page),
        [filters, sortBy, categories]
    );
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialData.products);
    const [allProducts, setAllProducts] = useState<Product[]>(initialData.products);
    const [popularProducts, setPopularProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState<Pagination>(initialData.pagination);
    const [isFiltering, setIsFiltering] = useState(false);

    // Сохраняем исходные данные для возврата при очистке фильтров
    const initialPagination = useRef(initialData.pagination);
    const initialProducts = useRef(initialData.products);

    // Ref для отслеживания последней загруженной страницы
    const lastPageRef = useRef(1);

    // Ref для отслеживания прогресса запросов
    const isRequestInProgressRef = useRef(false);
    const lastRequestIdRef = useRef<string | null>(null);

    // Применение всех фильтров через серверные запросы
    useEffect(() => {
        const applyAllFilters = async () => {
            // Не применяем фильтры при смене страницы (это делает отдельный useEffect)
            // Но пропускаем только если страница действительно изменилась и мы еще не загрузили данные
            if (pagination.page !== lastPageRef.current && lastPageRef.current !== 0) {
                return;
            }

            // Не применяем фильтры, если нет активных фильтров (используем данные с сервера)
            const hasActiveFilters = filters.search.trim() ||
                filters.categories.length > 0 ||
                filters.priceFrom ||
                filters.priceTo ||
                filters.shotsFrom ||
                filters.shotsTo ||
                filters.eventType;

            if (!hasActiveFilters && sortBy === 'popular') {
                // Проверяем текущую страницу из состояния и из URL
                const currentPage = pagination.page;
                const urlPageParam = typeof window !== 'undefined' 
                    ? new URLSearchParams(window.location.search).get('page')
                    : null;
                const urlPage = urlPageParam ? parseInt(urlPageParam, 10) : null;
                
                // Используем страницу из URL, если она есть, иначе из состояния
                const targetPage = (urlPage && !isNaN(urlPage) && urlPage > 0) ? urlPage : currentPage;
                
                // Если целевая страница > 1, загружаем данные для этой страницы
                if (targetPage > 1) {
                    // Загружаем данные для нужной страницы
                    setIsFiltering(true);
                    fetchProducts({
                        sortBy: 'popular',
                        page: targetPage,
                        limit: 20,
                    })
                        .then(data => {
                            setFilteredProducts(data.products || []);
                            setPagination(data.pagination || { ...initialPagination.current, page: targetPage });
                            lastPageRef.current = targetPage;
                        })
                        .catch(error => {
                            console.error('Error fetching page:', error);
                        })
                        .finally(() => {
                            setIsFiltering(false);
                            setIsInitializing(false);
                            isInitializingFromUrlRef.current = false;
                        });
                    return;
                }
                
                // Если страница 1, возвращаемся к исходным данным с сервера
                // Но только если мы не инициализируемся из URL с другой страницей
                if (!isInitializingFromUrlRef.current || targetPage === 1) {
                    setFilteredProducts(initialProducts.current);
                    setPagination({
                        ...initialPagination.current,
                        page: 1,
                    });
                    lastPageRef.current = 1;
                }
                // Завершаем инициализацию, если она была активна
                setIsInitializing(false);
                isInitializingFromUrlRef.current = false;
                return;
            }

            // Создаем уникальный идентификатор для запроса
            const requestParams = buildApiParams(pagination.page);

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

                // Проверяем, есть ли параметр page в URL, если нет - используем текущую страницу из состояния
                const urlPageParam = typeof window !== 'undefined' 
                    ? new URLSearchParams(window.location.search).get('page')
                    : null;
                const urlPage = urlPageParam ? parseInt(urlPageParam, 10) : null;
                const targetPage = (urlPage && !isNaN(urlPage) && urlPage > 0) ? urlPage : pagination.page;

                const data = await fetchProducts({
                    search: filters.search.trim() || undefined,
                    categoryId: categoryIds.length > 0 ? categoryIds : undefined,
                    minPrice: filters.priceFrom ? Number(filters.priceFrom) : undefined,
                    maxPrice: filters.priceTo ? Number(filters.priceTo) : undefined,
                    minShots: filters.shotsFrom ? Number(filters.shotsFrom) : undefined,
                    maxShots: filters.shotsTo ? Number(filters.shotsTo) : undefined,
                    eventType: filters.eventType || undefined,
                    sortBy: sortBy,
                    page: targetPage,
                    limit: 20,
                });

                setFilteredProducts(data.products || []);
                setPagination(data.pagination || { ...pagination, page: targetPage });
                lastPageRef.current = targetPage;
            } catch (error) {
                console.error('Error applying filters:', error);
            } finally {
                setIsFiltering(false);
                isRequestInProgressRef.current = false;
                // Завершаем инициализацию после применения фильтров
                setIsInitializing(false);
                isInitializingFromUrlRef.current = false;
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
    }, [filters, sortBy, buildApiParams, pagination.page, categories, setIsInitializing, isInitializingFromUrlRef]);

    // Отдельный useEffect для смены страницы
    useEffect(() => {
        // Пропускаем во время инициализации из URL
        if (isInitializingFromUrlRef.current) {
            return;
        }
        
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
                        minShots: filters.shotsFrom ? Number(filters.shotsFrom) : undefined,
                        maxShots: filters.shotsTo ? Number(filters.shotsTo) : undefined,
                        eventType: filters.eventType || undefined,
                        sortBy: sortBy,
                        page: pagination.page,
                        limit: 20,
                    });

                    setFilteredProducts(data.products || []);
                    setPagination(data.pagination || pagination);
                    lastPageRef.current = pagination.page;
                } catch (error) {
                    console.error('Error fetching page:', error);
                } finally {
                    setIsFiltering(false);
                    setIsPaginationLoading?.(false);
                }
            };

            fetchPage();
        }
    }, [pagination.page, categories, filters, sortBy]);

    // Загрузка всех товаров для поиска похожих и популярных товаров (один раз при монтировании)
    useEffect(() => {
        let isMounted = true;
        
        const loadAllProducts = async () => {
            try {
                // Загружаем все товары без фильтров и пагинации
                const data = await fetchProducts({
                    limit: 1000, // Большой лимит для получения всех товаров
                    sortBy: 'name',
                });
                
                if (isMounted && data.products && data.products.length > 0) {
                    setAllProducts(data.products);
                    
                    // Получаем популярные товары
                    const popular = data.products
                        .filter(p => p.is_popular === true)
                        .sort(() => Math.random() - 0.5) // Перемешиваем случайно
                        .slice(0, 3);
                    
                    if (popular.length < 3) {
                        // Если популярных меньше 3, добавляем случайные товары
                        const remaining = data.products
                            .filter(p => !popular.some(pp => pp.id === p.id))
                            .sort(() => Math.random() - 0.5)
                            .slice(0, 3 - popular.length);
                        popular.push(...remaining);
                    }
                    
                    setPopularProducts(popular.slice(0, 3));
                } else if (isMounted) {
                    // Если не загрузилось, используем начальные товары
                    setAllProducts(initialProducts.current);
                    
                    // Берем популярные из начальных
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
            } catch (error) {
                console.error('Error loading all products for similar search:', error);
                // В случае ошибки используем начальные товары из initialData
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

        // Всегда загружаем все товары для лучшего поиска похожих
        loadAllProducts();
        
        return () => {
            isMounted = false;
        };
    }, []); // Только при монтировании

    // Функция для сброса состояния запроса (используется при очистке фильтров)
    const resetRequestState = useCallback(() => {
        isRequestInProgressRef.current = false;
        lastRequestIdRef.current = null;
    }, []);

    return {
        filteredProducts,
        allProducts,
        popularProducts,
        pagination,
        setPagination,
        isFiltering,
        setIsFiltering,
        lastPageRef,
        resetRequestState,
    };
}

