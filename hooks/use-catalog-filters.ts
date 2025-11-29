import { useReducer, useCallback } from 'react';

export interface FilterState {
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

type FilterAction =
    | { type: 'SET_CATEGORIES'; payload: string[] }
    | { type: 'ADD_CATEGORY'; payload: string }
    | { type: 'REMOVE_CATEGORY'; payload: string }
    | { type: 'SET_PRICE'; payload: { from: string; to: string } }
    | { type: 'SET_PRICE_FROM'; payload: string }
    | { type: 'SET_PRICE_TO'; payload: string }
    | { type: 'CLEAR_PRICE' }
    | { type: 'SET_SHOTS'; payload: { from: string; to: string } }
    | { type: 'SET_SHOTS_FROM'; payload: string }
    | { type: 'SET_SHOTS_TO'; payload: string }
    | { type: 'CLEAR_SHOTS' }
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'CLEAR_SEARCH' }
    | { type: 'SET_EVENT_TYPE'; payload: 'wedding' | 'birthday' | 'new_year' | null }
    | { type: 'CLEAR_EVENT_TYPE' }
    | { type: 'UPDATE_STATS'; payload: { shotsMin?: number; shotsMax?: number; priceMin?: number; priceMax?: number } }
    | { type: 'SET_FILTERS'; payload: Partial<FilterState> }
    | { type: 'CLEAR_ALL' };

function filtersReducer(state: FilterState, action: FilterAction): FilterState {
    switch (action.type) {
        case 'SET_CATEGORIES':
            return { ...state, categories: action.payload };

        case 'ADD_CATEGORY':
            return {
                ...state,
                categories: state.categories.includes(action.payload)
                    ? state.categories
                    : [...state.categories, action.payload],
            };

        case 'REMOVE_CATEGORY':
            return {
                ...state,
                categories: state.categories.filter(cat => cat !== action.payload),
            };

        case 'SET_PRICE':
            return {
                ...state,
                priceFrom: action.payload.from,
                priceTo: action.payload.to,
            };

        case 'SET_PRICE_FROM':
            return { ...state, priceFrom: action.payload };

        case 'SET_PRICE_TO':
            return { ...state, priceTo: action.payload };

        case 'CLEAR_PRICE':
            return { ...state, priceFrom: '', priceTo: '' };

        case 'SET_SHOTS':
            return {
                ...state,
                shotsFrom: action.payload.from,
                shotsTo: action.payload.to,
            };

        case 'SET_SHOTS_FROM':
            return { ...state, shotsFrom: action.payload };

        case 'SET_SHOTS_TO':
            return { ...state, shotsTo: action.payload };

        case 'CLEAR_SHOTS':
            return { ...state, shotsFrom: '', shotsTo: '' };

        case 'SET_SEARCH':
            return { ...state, search: action.payload, eventType: null }; // Сбрасываем фильтр по событию при поиске

        case 'CLEAR_SEARCH':
            return { ...state, search: '' };

        case 'SET_EVENT_TYPE':
            return { ...state, eventType: action.payload };

        case 'CLEAR_EVENT_TYPE':
            return { ...state, eventType: null };

        case 'UPDATE_STATS':
            return {
                ...state,
                ...(action.payload.shotsMin !== undefined && { shotsMin: action.payload.shotsMin }),
                ...(action.payload.shotsMax !== undefined && { shotsMax: action.payload.shotsMax }),
                ...(action.payload.priceMin !== undefined && { priceMin: action.payload.priceMin }),
                ...(action.payload.priceMax !== undefined && { priceMax: action.payload.priceMax }),
            };

        case 'SET_FILTERS':
            // Если payload содержит все поля FilterState, заменяем полностью
            // Иначе делаем частичное обновление
            return { ...state, ...action.payload };

        case 'CLEAR_ALL':
            return {
                ...state,
                categories: [],
                priceFrom: '',
                priceTo: '',
                shotsFrom: '',
                shotsTo: '',
                search: '',
                eventType: null,
            };

        default:
            return state;
    }
}

interface UseCatalogFiltersProps {
    initialState: FilterState;
}

/**
 * Хук для управления состоянием фильтров каталога через useReducer
 * Предоставляет dispatch функцию и удобные методы для обновления фильтров
 */
export function useCatalogFilters({ initialState }: UseCatalogFiltersProps) {
    const [filters, dispatch] = useReducer(filtersReducer, initialState);

    // Удобные методы для обновления фильтров
    const setCategories = useCallback((categories: string[]) => {
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
    }, []);

    const addCategory = useCallback((category: string) => {
        dispatch({ type: 'ADD_CATEGORY', payload: category });
    }, []);

    const removeCategory = useCallback((category: string) => {
        dispatch({ type: 'REMOVE_CATEGORY', payload: category });
    }, []);

    const setPrice = useCallback((from: string, to: string) => {
        dispatch({ type: 'SET_PRICE', payload: { from, to } });
    }, []);

    const setPriceFrom = useCallback((from: string) => {
        dispatch({ type: 'SET_PRICE_FROM', payload: from });
    }, []);

    const setPriceTo = useCallback((to: string) => {
        dispatch({ type: 'SET_PRICE_TO', payload: to });
    }, []);

    const clearPrice = useCallback(() => {
        dispatch({ type: 'CLEAR_PRICE' });
    }, []);

    const setShots = useCallback((from: string, to: string) => {
        dispatch({ type: 'SET_SHOTS', payload: { from, to } });
    }, []);

    const setShotsFrom = useCallback((from: string) => {
        dispatch({ type: 'SET_SHOTS_FROM', payload: from });
    }, []);

    const setShotsTo = useCallback((to: string) => {
        dispatch({ type: 'SET_SHOTS_TO', payload: to });
    }, []);

    const clearShots = useCallback(() => {
        dispatch({ type: 'CLEAR_SHOTS' });
    }, []);

    const setSearch = useCallback((search: string) => {
        dispatch({ type: 'SET_SEARCH', payload: search });
    }, []);

    const clearSearch = useCallback(() => {
        dispatch({ type: 'CLEAR_SEARCH' });
    }, []);

    const setEventType = useCallback((eventType: 'wedding' | 'birthday' | 'new_year' | null) => {
        dispatch({ type: 'SET_EVENT_TYPE', payload: eventType });
    }, []);

    const clearEventType = useCallback(() => {
        dispatch({ type: 'CLEAR_EVENT_TYPE' });
    }, []);

    const updateStats = useCallback((stats: { shotsMin?: number; shotsMax?: number; priceMin?: number; priceMax?: number }) => {
        dispatch({ type: 'UPDATE_STATS', payload: stats });
    }, []);

    const setFilters = useCallback((newFilters: Partial<FilterState> | ((prev: FilterState) => Partial<FilterState> | FilterState)) => {
        if (typeof newFilters === 'function') {
            // Для функции-обновления нужно получить текущее состояние
            // Используем специальный подход: создаем action, который будет обработан с учетом текущего состояния
            const updatedFilters = newFilters(filters);
            dispatch({ type: 'SET_FILTERS', payload: updatedFilters });
        } else {
            dispatch({ type: 'SET_FILTERS', payload: newFilters });
        }
    }, [filters]);

    const clearAll = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' });
    }, []);

    return {
        filters,
        dispatch,
        // Удобные методы
        setCategories,
        addCategory,
        removeCategory,
        setPrice,
        setPriceFrom,
        setPriceTo,
        clearPrice,
        setShots,
        setShotsFrom,
        setShotsTo,
        clearShots,
        setSearch,
        clearSearch,
        setEventType,
        clearEventType,
        updateStats,
        setFilters,
        clearAll,
    };
}
