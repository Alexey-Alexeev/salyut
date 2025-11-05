import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/product-card';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    short_description?: string;
    is_popular?: boolean;
    category_name?: string | null;
    category_slug?: string | null;
}

interface PopularProductsSectionProps {
    products: Product[];
}

export function PopularProductsSection({ products }: PopularProductsSectionProps) {
    return (
        <section className="container mx-auto px-4">
            <div className="mb-12 space-y-4 text-center">
                <h2 className="text-3xl font-bold md:text-4xl">Популярные товары</h2>
                <p className="text-muted-foreground mx-auto max-w-2xl">
                    Самые востребованные фейерверки от наших покупателей
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                {products.map((product, index) => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        isFirst={index === 0}
                        isAboveFold={index < 4}
                    />
                ))}
            </div>

            <div className="mt-8 text-center">
                <Button
                    asChild
                    aria-label="Смотреть все товары"
                    variant="outline"
                    size="lg"
                >
                    <Link href="/catalog">Смотреть все товары</Link>
                </Button>
            </div>
        </section>
    );
}
