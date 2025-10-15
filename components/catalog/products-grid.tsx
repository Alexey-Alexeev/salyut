import { ProductCard } from '@/components/product-card';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    category_id: string | null;
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
    return (
        <div
            className={`grid gap-4 ${viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}
            style={{ gridAutoRows: '1fr' }}
        >
            {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                        <div className="bg-muted aspect-square rounded-lg mb-2" />
                        <div className="bg-muted h-4 rounded mb-2" />
                        <div className="bg-muted h-6 w-1/2 rounded" />
                    </div>
                ))
            ) : (
                products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))
            )}
        </div>
    );
}

