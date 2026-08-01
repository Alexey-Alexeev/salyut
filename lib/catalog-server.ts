import { getCatalog, withCategory } from '@/lib/catalog-data';
import { filterVisibleCategories } from '@/lib/schema-constants';

// Тип для категории
export interface CategoryData {
    id: string;
    name: string;
    slug: string;
}

// Прямые функции для получения данных на сервере (из catalog.php)
export async function getCategoriesData(): Promise<CategoryData[]> {
    try {
        const { categories } = await getCatalog();
        const mapped = categories
            .map((c) => ({ id: c.id, name: c.name, slug: c.slug }))
            .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        return filterVisibleCategories(mapped);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

// Сохранено для совместимости (кэш теперь на уровне модуля catalog-data)
export function clearCategoriesCache() {}

export async function getProductsData(page: number = 1, limit: number = 20, sortBy: string = 'name') {
    try {
        const { products, categories } = await getCatalog();

        const list = products
            .filter((p) => p.is_active)
            .map((p) => withCategory(p, categories));

        sortProducts(list, sortBy);

        const totalCount = list.length;
        const totalPages = Math.ceil(totalCount / limit);
        const from = (page - 1) * limit;
        const pageItems = list.slice(from, from + limit);

        return {
            products: pageItems,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        return {
            products: [],
            pagination: {
                page: 1,
                limit: 20,
                totalCount: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
            },
        };
    }
}

export async function getProductsStatsData() {
    try {
        const { products } = await getCatalog();
        const active = products.filter((p) => p.is_active);
        if (active.length === 0) {
            return { minPrice: 0, maxPrice: 10000 };
        }
        const prices = active.map((p) => p.price);
        return {
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
        };
    } catch (error) {
        console.error('Error fetching products stats:', error);
        return { minPrice: 0, maxPrice: 10000 };
    }
}

// Сортировка товаров — должна совпадать с клиентской в lib/api-client.ts
export function sortProducts<
    T extends { price: number; name: string; id: string; is_popular: boolean | null; created_at: string | null }
>(list: T[], sortBy: string): void {
    const byName = (a: T, b: T) =>
        a.name.localeCompare(b.name, 'ru') || a.id.localeCompare(b.id);
    switch (sortBy) {
        case 'price-asc':
        case 'price_asc':
            list.sort((a, b) => a.price - b.price || byName(a, b));
            break;
        case 'price-desc':
        case 'price_desc':
            list.sort((a, b) => b.price - a.price || byName(a, b));
            break;
        case 'popular':
            list.sort(
                (a, b) => Number(!!b.is_popular) - Number(!!a.is_popular) || byName(a, b)
            );
            break;
        case 'newest':
            list.sort(
                (a, b) =>
                    String(b.created_at || '').localeCompare(String(a.created_at || '')) ||
                    byName(a, b)
            );
            break;
        default:
            list.sort(byName);
    }
}
