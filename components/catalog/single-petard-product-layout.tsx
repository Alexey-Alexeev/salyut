import { ProductCard } from '@/components/product-card';
import { PetardsMotivationalBlock } from './petards-motivational-block';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    category_id: string | null;
    category_name?: string | null;
    category_slug?: string | null;
    images: string[] | null;
    video_url?: string | null;
    is_popular: boolean | null;
    characteristics?: Record<string, any> | null;
    short_description?: string | null;
}

interface SinglePetardProductLayoutProps {
    products: Product[];
}

export function SinglePetardProductLayout({ products }: SinglePetardProductLayoutProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-emerald-100 p-6 shadow-md lg:p-8">
            <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 right-0 h-40 w-40 rounded-full bg-emerald-300/30 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                {/* Карточка товара - фиксированная ширина на десктопе */}
                <div className="w-full lg:w-80 lg:flex-shrink-0">
                    <div className="grid grid-cols-1 gap-4">
                        {products.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isFirst={index === 0}
                                isAboveFold={index < 8}
                            />
                        ))}
                    </div>
                </div>

                {/* Мотивационный блок справа на десктопе, снизу на мобильных */}
                <PetardsMotivationalBlock />
            </div>
        </div>
    );
}

