import { getCatalog, withCategory } from '@/lib/catalog-data';
import { filterVisibleCategories } from '@/lib/schema-constants';
import { sortProducts } from '@/lib/product-sort';

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
