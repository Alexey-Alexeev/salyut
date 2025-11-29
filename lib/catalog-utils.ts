import { Product, ShotsStats, Category } from '@/types/catalog';
import { FilterState } from '@/hooks/use-catalog-filters';

/**
 * Вычисляет минимальное и максимальное значение залпов из списка товаров
 * @param productsList - Список товаров для анализа
 * @returns Объект с минимальным и максимальным значением залпов
 */
export function calculateShotsStats(productsList: Product[]): ShotsStats {
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
}

/**
 * Проверяет, является ли товар петардой
 * @param product - Товар для проверки
 * @returns true, если товар является петардой
 */
export function isPetard(product: Product): boolean {
    return product.category_slug === 'firecrackers' || product.category_name === 'Петарды';
}

/**
 * Строит строку параметров API для запроса товаров
 * @param filters - Состояние фильтров
 * @param sortBy - Тип сортировки
 * @param categories - Список категорий
 * @param page - Номер страницы
 * @returns Строка параметров для URL
 */
export function buildApiParams(
    filters: FilterState,
    sortBy: string,
    categories: Category[],
    page: number = 1
): string {
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
}

