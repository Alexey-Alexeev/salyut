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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
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
    );
}

