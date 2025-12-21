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
        <div className="relative overflow-hidden rounded-2xl border border-orange-300 bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6 shadow-md lg:p-8">
            <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-orange-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 right-0 h-40 w-40 rounded-full bg-orange-300/30 blur-3xl" />

            {/* Проверенный выбор магазина - по центру над обеими колонками */}
            <div className="relative mb-3 flex flex-col items-center gap-3">
                <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-6 py-3 text-xl font-semibold text-orange-800 shadow-sm backdrop-blur lg:text-2xl">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100">
                        <svg
                            className="h-7 w-7 text-orange-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </span>
                    Проверенный выбор магазина
                </div>
                <div className="inline-flex items-center gap-2.5 rounded-full bg-orange-100/90 px-5 py-2.5 text-center shadow-sm backdrop-blur">
                    <svg
                        className="h-5 w-5 flex-shrink-0 text-orange-700 lg:h-6 lg:w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <p className="text-base font-bold text-orange-900 lg:text-lg">
                        Петарды «Звиздец» — единственный бренд петард в магазине
                    </p>
                </div>
            </div>

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-8">
                {/* Карточка товара - фиксированная ширина на десктопе */}
                <div className="w-full xl:w-96 xl:flex-shrink-0">
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

