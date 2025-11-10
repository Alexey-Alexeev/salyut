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
import { fetchProducts } from '@/lib/api-client';
import { PRICE_VALID_UNTIL } from '@/lib/schema-constants';
import { CatalogCanonical } from '@/components/catalog/catalog-canonical';
import { findSimilarProducts } from '@/lib/similar-products';

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

interface FilterState {
    categories: string[];
    priceFrom: string;
    priceTo: string;
    priceMin: number;
    priceMax: number;
    shotsFrom: string;
    shotsTo: string;
    shotsMin: number;
    shotsMax: number;
    search: string;
    eventType: 'wedding' | 'birthday' | 'new_year' | null;
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

// Вспомогательная функция для проверки, является ли товар петардой
function isPetard(product: Product): boolean {
    return product.category_slug === 'firecrackers' || product.category_name === 'Петарды';
}

export function CatalogClient({ initialData, searchParams }: CatalogClientProps) {
    const router = useRouter();
    const urlSearchParams = useSearchParams();

    // Ref для отслеживания, была ли уже восстановлена позиция прокрутки
    const scrollRestoredRef = useRef<boolean>(false);

    // Отключаем автоматическое восстановление прокрутки браузером
    useEffect(() => {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }, []);

    // Ref для отслеживания предыдущей страницы
    const previousPageRef = useRef<number>(initialData.pagination.page || 1);

    // Отслеживаем нажатия кнопки "Назад" браузера
    useEffect(() => {
        const handlePopState = () => {
            // Сбрасываем флаг обновления URL, чтобы синхронизация сработала
            isUpdatingURLRef.current = false;
            
            // Получаем текущую страницу из URL (один раз)
            const currentPageParam = new URLSearchParams(window.location.search).get('page');
            const currentPage = currentPageParam ? parseInt(currentPageParam, 10) : 1;
            
            // Проверяем, вернулись ли мы в каталог из карточки товара
            const savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
            const returnUrl = sessionStorage.getItem('catalogReturnUrl');
            const returnPageParam = returnUrl ? new URLSearchParams(returnUrl.split('?')[1] || '').get('page') : null;
            const returnPage = returnPageParam ? parseInt(returnPageParam, 10) : 1;
            
            if (savedScrollPosition) {
                // Если текущая страница меньше сохраненной страницы возврата, значит вернулись назад
                // и это не возврат из карточки товара, а возврат между страницами каталога
                if (currentPage < returnPage) {
                    sessionStorage.removeItem('catalogScrollPosition');
                    sessionStorage.removeItem('catalogReturnUrl');
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                } else {
                    // Показываем лоадер при возврате из карточки товара
                    setIsRestoringScroll(true);
                    // Сбрасываем флаг восстановления, чтобы эффект восстановления сработал
                    scrollRestoredRef.current = false;
                }
            } else {
                // Если нет сохраненной позиции, значит это возврат между страницами каталога
                // Если вернулись на предыдущую страницу (меньшую), прокручиваем наверх
                if (currentPage < previousPageRef.current) {
                    setTimeout(() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }, 100);
                }
            }
            
            // Обновляем предыдущую страницу
            previousPageRef.current = currentPage;
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Основное состояние - инициализируем из server data
    const [categories] = useState<Category[]>(initialData.categories);
    const [products, setProducts] = useState<Product[]>(initialData.products);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialData.products);
    const [allProducts, setAllProducts] = useState<Product[]>(initialData.products); // Все товары для поиска похожих
    const [popularProducts, setPopularProducts] = useState<Product[]>([]); // Популярные товары для блока "Возможно вы имели в виду"
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [pagination, setPagination] = useState(initialData.pagination);

    // Сохраняем текущий URL каталога в sessionStorage при каждом изменении
    // Используем ref для предотвращения бесконечных циклов
    const lastSavedUrlRef = useRef<string>('');
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Используем небольшую задержку, чтобы дать время router.replace обновить URL
            const timeoutId = setTimeout(() => {
                // Используем window.location.search для получения всех параметров
                const searchParams = new URLSearchParams(window.location.search);
                
                // Если в URL нет параметра page, но pagination.page > 1, добавляем его
                if (!searchParams.has('page') && pagination.page > 1) {
                    searchParams.set('page', pagination.page.toString());
                }
                
                const queryString = searchParams.toString();
                const currentUrl = `/catalog${queryString ? `?${queryString}` : ''}`;
                
                // Сохраняем только если URL изменился
                if (currentUrl !== lastSavedUrlRef.current) {
                    sessionStorage.setItem('catalogReturnUrl', currentUrl);
                    lastSavedUrlRef.current = currentUrl;
                }
            }, 100);
            
            return () => clearTimeout(timeoutId);
        }
    }, [urlSearchParams.toString(), pagination.page]);

    // Ref для отслеживания, нужно ли сохранять позицию прокрутки
    // Отключаем сохранение сразу после восстановления позиции, чтобы не перезаписывать правильную позицию
    const shouldSaveScrollRef = useRef<boolean>(true);

    // Сохраняем позицию прокрутки каталога перед переходом в карточку товара
    useEffect(() => {
        if (typeof window !== 'undefined') {
            let scrollTimeout: NodeJS.Timeout;
            
            const handleScroll = () => {
                // Не сохраняем позицию прокрутки сразу после восстановления
                if (!shouldSaveScrollRef.current) {
                    return;
                }
                
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const scrollY = window.scrollY;
                    sessionStorage.setItem('catalogScrollPosition', scrollY.toString());
                }, 150);
            };

            // Сохраняем позицию прокрутки с небольшой задержкой (debounce)
            window.addEventListener('scroll', handleScroll, { passive: true });

            // Сохраняем позицию прокрутки перед уходом со страницы
            const handleBeforeUnload = () => {
                if (!shouldSaveScrollRef.current) {
                    return;
                }
                
                const scrollY = window.scrollY;
                sessionStorage.setItem('catalogScrollPosition', scrollY.toString());
            };

            window.addEventListener('beforeunload', handleBeforeUnload);

            return () => {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('beforeunload', handleBeforeUnload);
                clearTimeout(scrollTimeout);
            };
        }
    }, []);

    // Восстанавливаем позицию прокрутки при возврате в каталог
    useEffect(() => {
        if (typeof window !== 'undefined' && !scrollRestoredRef.current) {
            // Проверяем, вернулись ли мы из карточки товара
            const savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
            const returnUrl = sessionStorage.getItem('catalogReturnUrl');
            
            // Нормализуем pathname (убираем слеш в конце)
            const currentPathname = window.location.pathname.replace(/\/$/, '') || '/';
            const isCatalogPage = currentPathname === '/catalog';
            
            // Если есть сохраненная позиция и мы на странице каталога
            if (savedScrollPosition && returnUrl && isCatalogPage) {
                const scrollY = parseInt(savedScrollPosition, 10);
                
                if (!isNaN(scrollY) && scrollY >= 0) {
                    // Восстанавливаем позицию прокрутки после задержки
                    // чтобы дать время странице отрендериться и данным загрузиться
                    // Используем несколько попыток для надежности
                    let attempts = 0;
                    const maxAttempts = 5;
                    
                    const restoreScroll = () => {
                        attempts++;
                        
                        // Используем быструю плавную прокрутку через requestAnimationFrame
                        // для более быстрого и плавного восстановления позиции
                        const startScroll = window.scrollY;
                        const distance = scrollY - startScroll;
                        const duration = Math.min(Math.abs(distance) * 0.5, 400); // Максимум 400ms
                        const startTime = performance.now();
                        
                        const animateScroll = (currentTime: number) => {
                            const elapsed = currentTime - startTime;
                            const progress = Math.min(elapsed / duration, 1);
                            
                            // Используем easing функцию для более плавной анимации
                            const easeInOutQuad = progress < 0.5
                                ? 2 * progress * progress
                                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                            
                            const currentScroll = startScroll + distance * easeInOutQuad;
                            window.scrollTo(0, currentScroll);
                            
                            if (progress < 1) {
                                requestAnimationFrame(animateScroll);
                            }
                        };
                        
                        requestAnimationFrame(animateScroll);
                        
                        // Проверяем, была ли позиция восстановлена
                        // Задержка для проверки после начала анимации (максимум 400ms)
                        setTimeout(() => {
                            const currentScroll = window.scrollY;
                            
                            // Если позиция не восстановилась и есть попытки, пробуем еще раз
                            // Увеличиваем допуск для плавной прокрутки (может быть небольшая погрешность)
                            if (Math.abs(currentScroll - scrollY) > 100 && attempts < maxAttempts) {
                                restoreScroll();
                            } else {
                                // Удаляем сохраненную позицию после восстановления
                                sessionStorage.removeItem('catalogScrollPosition');
                                scrollRestoredRef.current = true;
                                // Скрываем лоадер после восстановления позиции
                                setIsRestoringScroll(false);
                                
                                // Включаем сохранение позиции прокрутки через небольшую задержку
                                // чтобы не перезаписывать правильную позицию сразу после восстановления
                                setTimeout(() => {
                                    shouldSaveScrollRef.current = true;
                                }, 500);
                            }
                        }, 450);
                    };
                    
                    // Отключаем сохранение позиции прокрутки во время восстановления
                    shouldSaveScrollRef.current = false;
                    
                    // Первая попытка через 400ms (уменьшена задержка для более быстрого восстановления)
                    // Восстанавливаем только после загрузки данных
                    const restoreTimeout = setTimeout(() => {
                        // Проверяем, что данные загружены и страница отрендерена
                        const checkDataLoaded = () => {
                            const hasData = filteredProducts.length > 0 || !isFiltering;
                            const hasContent = document.body.scrollHeight > window.innerHeight;
                            
                            return hasData && hasContent;
                        };
                        
                        if (checkDataLoaded()) {
                            restoreScroll();
                        } else {
                            // Если данные еще не загружены, ждем еще
                            const waitForData = setInterval(() => {
                                if (checkDataLoaded()) {
                                    clearInterval(waitForData);
                                    restoreScroll();
                                }
                            }, 50); // Уменьшена задержка проверки
                            
                            // Максимальное время ожидания - 2 секунды (уменьшено)
                            setTimeout(() => {
                                clearInterval(waitForData);
                                restoreScroll();
                            }, 2000);
                        }
                    }, 400);

                    return () => clearTimeout(restoreTimeout);
                }
            } else {
                // Скрываем лоадер, если условия не выполнены
                setIsRestoringScroll(false);
                
                // Получаем текущую страницу из URL (один раз)
                const currentPageParam = urlSearchParams.get('page');
                const currentPage = currentPageParam ? parseInt(currentPageParam, 10) : 1;
                
                // Если нет сохраненной позиции, но мы на странице каталога,
                // и это возврат назад между страницами, прокручиваем наверх
                if (!savedScrollPosition && isCatalogPage) {
                    // Если вернулись на предыдущую страницу (меньшую), прокручиваем наверх
                    if (currentPage < previousPageRef.current) {
                        setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                    }
                }
                
                // Проверяем, вернулись ли мы на предыдущую страницу каталога (не из карточки товара)
                // Если да, очищаем сохраненную позицию прокрутки из карточки товара и прокручиваем наверх
                if (savedScrollPosition && returnUrl && isCatalogPage) {
                    const returnPageParam = returnUrl ? new URLSearchParams(returnUrl.split('?')[1] || '').get('page') : null;
                    const returnPage = returnPageParam ? parseInt(returnPageParam, 10) : 1;
                    
                    // Если текущая страница меньше сохраненной страницы возврата, значит вернулись назад
                    // и это не возврат из карточки товара, а возврат между страницами каталога
                    if (currentPage < returnPage) {
                        sessionStorage.removeItem('catalogScrollPosition');
                        sessionStorage.removeItem('catalogReturnUrl');
                        setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }, 100);
                    }
                }
                
                // Обновляем предыдущую страницу
                if (isCatalogPage) {
                    previousPageRef.current = currentPage;
                }
            }
        } else {
            // Скрываем лоадер, если восстановление уже было
            setIsRestoringScroll(false);
        }
    }, [urlSearchParams.toString(), pagination.page, filteredProducts.length]);

    // Сбрасываем флаг восстановления прокрутки при изменении URL или страницы
    // НО только если нет сохраненной позиции прокрутки (т.е. это не возврат из карточки товара)
    useEffect(() => {
        const savedScrollPosition = sessionStorage.getItem('catalogScrollPosition');
        // Сбрасываем флаг только если нет сохраненной позиции (т.е. это не возврат из карточки товара)
        if (!savedScrollPosition) {
            scrollRestoredRef.current = false;
        }
        
        // Обновляем предыдущую страницу при изменении страницы
        previousPageRef.current = pagination.page;
    }, [urlSearchParams.toString(), pagination.page]);

    // Сохраняем исходные данные для возврата при очистке фильтров
    const initialPagination = useRef(initialData.pagination);
    const initialProducts = useRef(initialData.products);

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
    
    useEffect(() => {
        const stats = calculateShotsStats(allProducts);
        setShotsStats(stats);
        // Обновляем min/max в фильтрах
        setFilters(prev => ({
            ...prev,
            shotsMin: stats.min,
            shotsMax: stats.max,
        }));
    }, [allProducts, calculateShotsStats]);

    // Состояние фильтров
    const [filters, setFilters] = useState<FilterState>({
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
    });

    // Состояние интерфейса
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [isPaginationLoading, setIsPaginationLoading] = useState(false);
    const [isRestoringScroll, setIsRestoringScroll] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [priceFromValue, setPriceFromValue] = useState('');
    const [priceToValue, setPriceToValue] = useState('');
    const [shotsFromValue, setShotsFromValue] = useState('');
    const [shotsToValue, setShotsToValue] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const priceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shotsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastPageRef = useRef(1);
    const hasInitializedRef = useRef(false);
    const isInitializingFromUrlRef = useRef(false);
    const initializationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isRequestInProgressRef = useRef(false);
    const lastRequestIdRef = useRef<string | null>(null);
    const isUpdatingURLRef = useRef(false);

    // Стабилизируем список товаров для предотвращения лишних рендеров
    const stableProducts = useMemo(() => {
        return filteredProducts;
    }, [filteredProducts]);

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
    }, [sortBy, filters, categories]); // Убрали pagination.page из зависимостей

    // Мемоизируем функцию сброса страницы
    const resetPage = useCallback(() => {
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    // Функция для обновления URL с фильтрами
    const updateURL = useCallback((newFilters: Partial<FilterState>, newSortBy?: string, newPage?: number, addToHistory: boolean = false) => {
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
        const hasUrlParams = (categoryParam && categoryParam.length > 0) || searchParam || minPriceParam || maxPriceParam || minShotsParam || maxShotsParam || eventTypeParam || sortByParam || (pageParam > 1);

        // Устанавливаем страницу независимо от других параметров
        if (!isNaN(pageParam) && pageParam > 0) {
            setPagination(p => {
                // Обновляем только если страница действительно изменилась
                if (p.page !== pageParam) {
                    lastPageRef.current = pageParam; // Обновляем ref ДО обновления состояния
                    return { ...p, page: pageParam };
                }
                return p;
            });
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
                setIsInitializing(true);
            }, 100);

            setFilters(prev => ({
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
            if (minShotsParam) {
                setShotsFromValue(minShotsParam);
            }
            if (maxShotsParam) {
                setShotsToValue(maxShotsParam);
            }
        } else {
            // Если нет параметров URL, сразу завершаем инициализацию
            setIsInitializing(false);
        }

        hasInitializedRef.current = true;
    }, [searchParams]);

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
        setFilters(prev => {
            // Проверяем, нужно ли обновлять фильтры
            const categoriesChanged = JSON.stringify(prev.categories.sort()) !== JSON.stringify(categoriesFromUrl.sort());
            const searchChanged = (prev.search || '') !== (searchParam || '');
            const priceFromChanged = (prev.priceFrom || '') !== (minPriceParam || '');
            const priceToChanged = (prev.priceTo || '') !== (maxPriceParam || '');
            const shotsFromChanged = (prev.shotsFrom || '') !== (minShotsParam || '');
            const shotsToChanged = (prev.shotsTo || '') !== (maxShotsParam || '');
            const eventTypeChanged = (prev.eventType || null) !== (eventTypeParam || null);

            if (!hasUrlParams) {
                // Если URL параметров фильтров нет, сбрасываем фильтры
                if (prev.categories.length === 0 && 
                    !prev.search.trim() && 
                    !prev.priceFrom && 
                    !prev.priceTo &&
                    !prev.shotsFrom &&
                    !prev.shotsTo &&
                    !prev.eventType) {
                    return prev; // Фильтры уже сброшены
                }
                return {
                    ...prev,
                    categories: [],
                    search: '',
                    priceFrom: '',
                    priceTo: '',
                    shotsFrom: '',
                    shotsTo: '',
                    eventType: null,
                };
            }

            // Если есть параметры в URL, но фильтры не изменились, не обновляем
            if (!categoriesChanged && !searchChanged && !priceFromChanged && !priceToChanged && !shotsFromChanged && !shotsToChanged && !eventTypeChanged) {
                return prev;
            }

            // Восстанавливаем фильтры из URL
            return {
                ...prev,
                categories: categoriesFromUrl,
                search: searchParam || '',
                priceFrom: minPriceParam || '',
                priceTo: maxPriceParam || '',
                shotsFrom: minShotsParam || '',
                shotsTo: maxShotsParam || '',
                eventType: eventTypeParam || null,
            };
        });

        // Синхронизируем значения полей с URL параметрами
        if (hasUrlParams) {
            setSearchValue(searchParam || '');
            setPriceFromValue(minPriceParam || '');
            setPriceToValue(maxPriceParam || '');
            setShotsFromValue(minShotsParam || '');
            setShotsToValue(maxShotsParam || '');
        } else {
            setSearchValue('');
            setPriceFromValue('');
            setPriceToValue('');
            setShotsFromValue('');
            setShotsToValue('');
        }
        
        // Синхронизируем сортировку
        if (sortByParam) {
            setSortBy(sortByParam);
        } else {
            setSortBy(prevSortBy => {
                if (prevSortBy !== 'popular') {
                    return 'popular';
                }
                return prevSortBy;
            });
        }

        // Синхронизируем страницу
        if (pageParam) {
            const page = parseInt(pageParam, 10);
            if (!isNaN(page) && page > 0) {
                setPagination(prev => {
                    // Обновляем только если страница действительно изменилась
                    if (prev.page !== page) {
                        // НЕ обновляем lastPageRef здесь, чтобы useEffect для загрузки данных сработал
                        return { ...prev, page };
                    }
                    return prev;
                });
            }
        } else {
            // Если в URL нет параметра page, но мы на странице > 1, сбрасываем на 1
            if (pagination.page > 1) {
                // НЕ обновляем lastPageRef здесь, чтобы useEffect для загрузки данных сработал
                setPagination(prev => ({ ...prev, page: 1 }));
            }
            // Не обновляем lastPageRef здесь - это сделает useEffect для загрузки данных
        }
    }, [urlSearchParams.toString(), pagination.page]); // Добавили pagination.page для отслеживания изменений

    // Синхронизация значений полей цены с фильтрами
    useEffect(() => {
        // Не синхронизируем во время инициализации из URL
        if (isInitializingFromUrlRef.current) {
            return;
        }
        setPriceFromValue(filters.priceFrom);
        setPriceToValue(filters.priceTo);
    }, [filters.priceFrom, filters.priceTo]);

    // Синхронизация значений полей залпов с фильтрами
    useEffect(() => {
        // Не синхронизируем во время инициализации из URL
        if (isInitializingFromUrlRef.current) {
            return;
        }
        setShotsFromValue(filters.shotsFrom);
        setShotsToValue(filters.shotsTo);
    }, [filters.shotsFrom, filters.shotsTo]);

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
                            if (isInitializing) {
                                setIsInitializing(false);
                                isInitializingFromUrlRef.current = false;
                            }
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
        // всегда сбрасываем страницу при смене сортировки (но сброс ТОЛЬКО по намерению)
        setSortBy(newSortBy);
        setPagination(prev => ({ ...prev, page: 1 }));
        updateURL(filters, newSortBy, 1);
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

    const handleShotsChange = useCallback((from: string, to: string) => {
        resetPage();
        const newFilters = {
            ...filters,
            shotsFrom: from,
            shotsTo: to,
        };
        setFilters(prev => ({
            ...prev,
            shotsFrom: from,
            shotsTo: to,
        }));
        updateURL(newFilters, sortBy);
    }, [resetPage, filters, sortBy, updateURL]);

    const handleEventTypeChange = useCallback((eventType: 'wedding' | 'birthday' | 'new_year' | null) => {
        resetPage();
        const newFilters = {
            ...filters,
            eventType: eventType,
        };
        setFilters(prev => ({
            ...prev,
            eventType: eventType,
        }));
        updateURL(newFilters, sortBy);
    }, [resetPage, filters, sortBy, updateURL]);

    const handleShotsFromChange = useCallback((value: string) => {
        setShotsFromValue(value);

        // Очищаем предыдущий таймаут
        if (shotsTimeoutRef.current) {
            clearTimeout(shotsTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем фильтр
        if (value.trim() === '') {
            resetPage();
            setFilters(prev => {
                const newFilters = {
                    ...prev,
                    shotsFrom: '',
                };
                updateURL(newFilters, sortBy);
                return newFilters;
            });
            return;
        }

        // Устанавливаем новый таймаут для debouncing
        shotsTimeoutRef.current = setTimeout(() => {
            resetPage();
            setFilters(prev => {
                const newFilters = {
                    ...prev,
                    shotsFrom: value,
                };
                updateURL(newFilters, sortBy);
                return newFilters;
            });
        }, 500);
    }, [resetPage, sortBy, updateURL]);

    const handleShotsToChange = useCallback((value: string) => {
        setShotsToValue(value);

        // Очищаем предыдущий таймаут
        if (shotsTimeoutRef.current) {
            clearTimeout(shotsTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем фильтр
        if (value.trim() === '') {
            resetPage();
            setFilters(prev => {
                const newFilters = {
                    ...prev,
                    shotsTo: '',
                };
                updateURL(newFilters, sortBy);
                return newFilters;
            });
            return;
        }

        // Устанавливаем новый таймаут для debouncing
        shotsTimeoutRef.current = setTimeout(() => {
            resetPage();
            setFilters(prev => {
                const newFilters = {
                    ...prev,
                    shotsTo: value,
                };
                updateURL(newFilters, sortBy);
                return newFilters;
            });
        }, 500);
    }, [resetPage, sortBy, updateURL]);

    const handleClearShots = useCallback(() => {
        setShotsFromValue('');
        setShotsToValue('');
        resetPage();
        const newFilters = {
            ...filters,
            shotsFrom: '',
            shotsTo: '',
        };
        setFilters(prev => ({
            ...prev,
            shotsFrom: '',
            shotsTo: '',
        }));
        updateURL(newFilters, sortBy);

        // Очищаем таймаут
        if (shotsTimeoutRef.current) {
            clearTimeout(shotsTimeoutRef.current);
        }
    }, [resetPage, filters, sortBy, updateURL]);

    const handleClearEventType = useCallback(() => {
        resetPage();
        const newFilters = {
            ...filters,
            eventType: null,
        };
        setFilters(prev => ({
            ...prev,
            eventType: null,
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
            setFilters(prev => {
                const newFilters = {
                    ...prev,
                    search: value,
                    // Сбрасываем фильтр по событию при поиске - ищем для всех событий
                    eventType: null,
                };
                updateURL(newFilters, sortBy);
                return newFilters;
            });
            setIsSearching(false);
        }, 300); // 300ms задержка для более быстрого отклика
    }, [resetPage, sortBy, updateURL]);

    const handlePriceFromChange = useCallback((value: string) => {
        setPriceFromValue(value);

        // Очищаем предыдущий таймаут
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем фильтр
        if (value.trim() === '') {
            resetPage();
            setFilters(prev => {
                const newFilters = {
                    ...prev,
                    priceFrom: '',
                };
                updateURL(newFilters, sortBy);
                return newFilters;
            });
            return;
        }

        // Устанавливаем новый таймаут для debouncing
        priceTimeoutRef.current = setTimeout(() => {
            resetPage();
            setFilters(prev => {
                const newFilters = {
                    ...prev,
                    priceFrom: value,
                };
                updateURL(newFilters, sortBy);
                return newFilters;
            });
        }, 500); // 500ms задержка для цены (чуть больше, чем для поиска)
    }, [resetPage, sortBy, updateURL]);

    const handlePriceToChange = useCallback((value: string) => {
        setPriceToValue(value);

        // Очищаем предыдущий таймаут
        if (priceTimeoutRef.current) {
            clearTimeout(priceTimeoutRef.current);
        }

        // Если поле пустое, сразу очищаем фильтр
        if (value.trim() === '') {
            resetPage();
            setFilters(prev => {
                const newFilters = {
                    ...prev,
                    priceTo: '',
                };
                updateURL(newFilters, sortBy);
                return newFilters;
            });
            return;
        }

        // Устанавливаем новый таймаут для debouncing
        priceTimeoutRef.current = setTimeout(() => {
            resetPage();
            setFilters(prev => {
                const newFilters = {
                    ...prev,
                    priceTo: value,
                };
                updateURL(newFilters, sortBy);
                return newFilters;
            });
        }, 500); // 500ms задержка для цены (чуть больше, чем для поиска)
    }, [resetPage, sortBy, updateURL]);

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
        setShotsFromValue('');
        setShotsToValue('');
        setIsSearching(false);
        resetPage();
        setSortBy('popular'); // Сбрасываем сортировку к умолчанию
        const newFilters = {
            categories: [],
            priceFrom: '',
            priceTo: '',
            shotsFrom: '',
            shotsTo: '',
            search: '',
            eventType: null,
        };
        setFilters(prev => ({
            ...prev,
            ...newFilters,
        }));
        updateURL(newFilters, 'popular');

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
        isRequestInProgressRef.current = false;
        lastRequestIdRef.current = null;
    }, [resetPage, updateURL]);

    const handlePageChange = useCallback((page: number) => {
        // Очищаем сохраненную позицию прокрутки при смене страницы через пагинацию
        // чтобы эффект восстановления не перезаписывал скролл наверх
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('catalogScrollPosition');
            scrollRestoredRef.current = true; // Устанавливаем флаг, чтобы эффект восстановления не сработал
            setIsRestoringScroll(false); // Скрываем лоадер восстановления
            // Обновляем предыдущую страницу
            previousPageRef.current = pagination.page;
        }
        
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
    }, [filters, sortBy, updateURL]);

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
                    setIsPaginationLoading(false);
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
