import { useEffect } from 'react';
import { Product } from '@/types/catalog';
import { calculateShotsStats } from '@/lib/catalog-utils';

interface UseCatalogShotsStatsProps {
    allProducts: Product[];
    updateStats: (stats: { shotsMin?: number; shotsMax?: number }) => void;
}

/**
 * Хук для управления статистикой залпов товаров
 * Автоматически обновляет min/max значения залпов при изменении списка товаров
 */
export function useCatalogShotsStats({
    allProducts,
    updateStats,
}: UseCatalogShotsStatsProps) {
    useEffect(() => {
        const stats = calculateShotsStats(allProducts);
        // Обновляем min/max в фильтрах
        updateStats({
            shotsMin: stats.min,
            shotsMax: stats.max,
        });
    }, [allProducts, updateStats]);
}
