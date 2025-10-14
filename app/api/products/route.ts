import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories } from '@/db/schema';
import { eq, ilike, and, sql, desc, asc, inArray } from 'drizzle-orm';

// Кэш для часто запрашиваемых данных
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Ограничиваем максимум
    const offset = (page - 1) * limit;
    const sortBy = searchParams.get('sortBy') || 'name';
    const categoryId = searchParams.get('categoryId');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const isPopular = searchParams.get('isPopular');

    // Создаем ключ кэша
    const cacheKey = `products:${JSON.stringify({
      search, page, limit, sortBy, categoryId, minPrice, maxPrice, isPopular
    })}`;

    // Проверяем кэш
    const cached = getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Строим условия для фильтрации
    const conditions = [eq(products.is_active, true)];

    // Добавляем поиск по названию товара
    if (search && search.trim()) {
      conditions.push(ilike(products.name, `%${search.trim()}%`));
    }

    // Фильтр по категории
    if (categoryId) {
      conditions.push(eq(products.category_id, categoryId));
    }

    // Фильтр по цене
    if (minPrice) {
      conditions.push(sql`${products.price} >= ${parseInt(minPrice)}`);
    }
    if (maxPrice) {
      conditions.push(sql`${products.price} <= ${parseInt(maxPrice)}`);
    }

    // Фильтр по популярности
    if (isPopular === 'true') {
      conditions.push(eq(products.is_popular, true));
    }

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

    // Получаем общее количество товаров для пагинации
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions));

    // Получаем товары с пагинацией и сортировкой
    const productsQuery = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        category_id: products.category_id,
        images: products.images,
        is_popular: products.is_popular,
        short_description: products.short_description,
        characteristics: products.characteristics,
        created_at: products.created_at,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(...orderBy)
      .limit(limit)
      .offset(offset);

    const [totalCountResult, productsData] = await Promise.all([
      totalCountQuery,
      productsQuery,
    ]);

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

    // Кэшируем результат
    setCachedData(cacheKey, result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
