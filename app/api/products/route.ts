import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/db/schema';
import { eq, ilike, and, sql } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Строим условия для фильтрации
    const conditions = [eq(products.is_active, true)];

    // Добавляем поиск по названию товара, если указан параметр search
    if (search && search.trim()) {
      conditions.push(ilike(products.name, `%${search.trim()}%`));
    }

    // Получаем общее количество товаров для пагинации
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(...conditions));

    // Получаем товары с пагинацией
    const productsQuery = db
      .select()
      .from(products)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(products.name, products.id);

    const [totalCountResult, productsData] = await Promise.all([
      totalCountQuery,
      productsQuery,
    ]);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      products: productsData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
