import { Product } from '@/types/catalog';
import { findSimilarProducts } from '@/lib/similar-products';

/**
 * Подготавливает список товаров для отображения в пустом состоянии каталога
 * Включает похожие товары (если есть поисковый запрос) и популярные товары
 * @param searchQuery - Поисковый запрос пользователя
 * @param allProducts - Все доступные товары
 * @param popularProducts - Популярные товары
 * @param maxProducts - Максимальное количество товаров для отображения
 * @returns Массив товаров для отображения
 */
export function prepareEmptyStateProducts(
    searchQuery: string | undefined,
    allProducts: Product[],
    popularProducts: Product[],
    maxProducts: number = 2
): Product[] {
    // Ищем похожие товары только если есть поисковый запрос
    const similarProducts = searchQuery && allProducts.length > 0
        ? findSimilarProducts(searchQuery, allProducts, maxProducts)
        : [];
    
    // Если похожих товаров меньше нужного количества, дополняем популярными
    const productsToShow = [...similarProducts];
    
    // Если не хватает до нужного количества, добавляем популярные товары
    if (productsToShow.length < maxProducts && popularProducts.length > 0) {
        const remaining = popularProducts
            .filter(p => !productsToShow.some(sp => sp.id === p.id))
            .slice(0, maxProducts - productsToShow.length);
        productsToShow.push(...remaining);
    }
    
    return productsToShow.slice(0, maxProducts);
}

