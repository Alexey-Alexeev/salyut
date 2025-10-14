import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// Кэш для статистики
const statsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 минут

function getCachedStats(key: string) {
    const cached = statsCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function setCachedStats(key: string, data: any) {
    statsCache.set(key, { data, timestamp: Date.now() });
}

export async function GET() {
    try {
        const cacheKey = 'products:stats';

        // Проверяем кэш
        const cached = getCachedStats(cacheKey);
        if (cached) {
            return NextResponse.json(cached);
        }

        // Получаем статистику по ценам
        const statsQuery = db
            .select({
                minPrice: sql<number>`min(${products.price})`,
                maxPrice: sql<number>`max(${products.price})`,
                avgPrice: sql<number>`avg(${products.price})`,
                totalCount: sql<number>`count(*)`,
            })
            .from(products)
            .where(eq(products.is_active, true));

        const [statsResult] = await statsQuery;

        const stats = {
            minPrice: statsResult?.minPrice || 0,
            maxPrice: statsResult?.maxPrice || 10000,
            avgPrice: Math.round(statsResult?.avgPrice || 0),
            totalCount: statsResult?.totalCount || 0,
        };

        // Кэшируем результат
        setCachedStats(cacheKey, stats);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching product stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product stats' },
            { status: 500 }
        );
    }
}
