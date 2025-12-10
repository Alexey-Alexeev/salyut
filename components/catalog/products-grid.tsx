'use client';

import { ProductCard } from '@/components/product-card';
import { useCatalogAttentionAnimation } from '@/hooks/use-catalog-attention-animation';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    category_id: string | null;
    category_name?: string | null;
    category_slug?: string | null;
    images: string[] | null;
    is_popular: boolean | null;
    characteristics?: Record<string, any> | null;
    short_description?: string | null;
}

interface ProductsGridProps {
    products: Product[];
    viewMode: 'grid' | 'list';
    isLoading?: boolean;
}

export function ProductsGrid({
    products,
    viewMode,
    isLoading = false,
}: ProductsGridProps) {
    // Используем хук для управления анимацией привлечения внимания
    const animatedProductId = useCatalogAttentionAnimation({
        products,
        delay: 20000, // 20 секунд
    });

    return (
        <div
            data-products-container
            className={`grid gap-4 ${viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
        >
            {/* Показываем товары, даже если идет загрузка - это предотвращает мерцание */}
            {products.map((product, index) => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    isFirst={index === 0} 
                    isAboveFold={index < 8}
                    showAttentionAnimation={animatedProductId === product.id}
                />
            ))}
            
            {/* Показываем skeleton'ы только если нет товаров и идет загрузка */}
            {isLoading && products.length === 0 && (
                Array.from({ length: 8 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="animate-pulse">
                        <div className="bg-muted aspect-square rounded-lg mb-2" />
                        <div className="bg-muted h-4 rounded mb-2" />
                        <div className="bg-muted h-6 w-1/2 rounded" />
                    </div>
                ))
            )}
            
            {/* Показываем дополнительные skeleton'ы поверх существующих товаров при загрузке */}
            {isLoading && products.length > 0 && (
                Array.from({ length: 4 }).map((_, index) => (
                    <div key={`loading-${index}`} className="animate-pulse opacity-50">
                        <div className="bg-muted aspect-square rounded-lg mb-2" />
                        <div className="bg-muted h-4 rounded mb-2" />
                        <div className="bg-muted h-6 w-1/2 rounded" />
                    </div>
                ))
            )}
        </div>
    );
}

