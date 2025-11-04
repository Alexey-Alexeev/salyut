import { db } from '@/lib/db';
import { products, categories } from '@/db/schema';
import { eq, sql, desc, asc, inArray, and } from 'drizzle-orm';

// Кэш для server-side функций
const serverCache = new Map<string, { data: any; timestamp: number }>();
const SERVER_CACHE_TTL = 5 * 60 * 1000; // 5 минут

function getCachedServerData(key: string) {
    const cached = serverCache.get(key);
    if (cached && Date.now() - cached.timestamp < SERVER_CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedServerData(key: string, data: any) {
    serverCache.set(key, { data, timestamp: Date.now() });
}

// Прямые функции для получения данных на сервере
export async function getCategoriesData() {
    const cacheKey = 'categories';
    const cached = getCachedServerData(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const result = await db
            .select({
                id: categories.id,
                name: categories.name,
                slug: categories.slug,
            })
            .from(categories)
            .orderBy(asc(categories.name));

        setCachedServerData(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

export async function getProductsData(page: number = 1, limit: number = 20, sortBy: string = 'name') {
    const cacheKey = `products:${page}:${limit}:${sortBy}`;
    const cached = getCachedServerData(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const offset = (page - 1) * limit;

        // Определяем сортировку
        let orderBy;
        switch (sortBy) {
            case 'price-asc':
                orderBy = [asc(products.price), asc(products.name)];
                break;
            case 'price-desc':
                orderBy = [desc(products.price), asc(products.name)];
                break;
            case 'popular':
                orderBy = [desc(products.is_popular), desc(products.created_at), asc(products.name)];
                break;
            case 'newest':
                orderBy = [desc(products.created_at), asc(products.name)];
                break;
            default:
                orderBy = [asc(products.name)];
        }

        // Получаем общее количество товаров
        const totalCountResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(products)
            .where(eq(products.is_active, true));

        // Получаем товары с пагинацией
        const productsData = await db
            .select({
                id: products.id,
                name: products.name,
                slug: products.slug,
                price: products.price,
                category_id: products.category_id,
                images: products.images,
                video_url: products.video_url,
                is_popular: products.is_popular,
                short_description: products.short_description,
                characteristics: products.characteristics,
                created_at: products.created_at,
            })
            .from(products)
            .where(eq(products.is_active, true))
            .orderBy(...orderBy)
            .limit(limit)
            .offset(offset);

        const totalCount = totalCountResult[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        const result = {
            products: productsData,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };

        setCachedServerData(cacheKey, result);
        return result;
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

// Получение продуктов с фильтрами по категориям (для оптимизации рекламных ссылок)
export async function getProductsDataWithCategories(
    categorySlugs: string[],
    page: number = 1,
    limit: number = 20,
    sortBy: string = 'popular'
) {
    const cacheKey = `products:categories:${categorySlugs.join(',')}:${page}:${limit}:${sortBy}`;
    const cached = getCachedServerData(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        // Получаем ID категорий по slug'ам
        const categoriesData = await db
            .select({ id: categories.id })
            .from(categories)
            .where(inArray(categories.slug, categorySlugs));

        const categoryIds = categoriesData.map(c => c.id);
        if (categoryIds.length === 0) {
            return getProductsData(page, limit, sortBy);
        }

        const offset = (page - 1) * limit;

        // Определяем сортировку
        let orderBy;
        switch (sortBy) {
            case 'price-asc':
                orderBy = [asc(products.price), asc(products.name)];
                break;
            case 'price-desc':
                orderBy = [desc(products.price), asc(products.name)];
                break;
            case 'popular':
                orderBy = [desc(products.is_popular), desc(products.created_at), asc(products.name)];
                break;
            case 'newest':
                orderBy = [desc(products.created_at), asc(products.name)];
                break;
            default:
                orderBy = [asc(products.name)];
        }

        // Получаем общее количество товаров с фильтром по категориям
        const totalCountResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(products)
            .where(
                and(
                    eq(products.is_active, true),
                    inArray(products.category_id, categoryIds)
                )
            );

        // Получаем товары с фильтром по категориям
        const productsData = await db
            .select({
                id: products.id,
                name: products.name,
                slug: products.slug,
                price: products.price,
                category_id: products.category_id,
                images: products.images,
                video_url: products.video_url,
                is_popular: products.is_popular,
                short_description: products.short_description,
                characteristics: products.characteristics,
                created_at: products.created_at,
            })
            .from(products)
            .where(
                and(
                    eq(products.is_active, true),
                    inArray(products.category_id, categoryIds)
                )
            )
            .orderBy(...orderBy)
            .limit(limit)
            .offset(offset);

        const totalCount = totalCountResult[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        const result = {
            products: productsData,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };

        setCachedServerData(cacheKey, result);
        return result;
    } catch (error) {
        console.error('Error fetching products with categories:', error);
        return getProductsData(page, limit, sortBy);
    }
}

export async function getProductsStatsData() {
    const cacheKey = 'products-stats';
    const cached = getCachedServerData(cacheKey);
    if (cached) {
        return cached;
    }

    try {
        const result = await db
            .select({
                minPrice: sql<number>`min(${products.price})`,
                maxPrice: sql<number>`max(${products.price})`,
            })
            .from(products)
            .where(eq(products.is_active, true));

        const stats = {
            minPrice: result[0]?.minPrice || 0,
            maxPrice: result[0]?.maxPrice || 10000,
        };

        setCachedServerData(cacheKey, stats);
        return stats;
    } catch (error) {
        console.error('Error fetching products stats:', error);
        return {
            minPrice: 0,
            maxPrice: 10000,
        };
    }
}
