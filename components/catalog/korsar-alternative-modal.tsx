'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductCard } from '@/components/product-card';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    old_price?: number | null;
    category_id: string | null;
    category_name?: string | null;
    category_slug?: string | null;
    images: string[] | null;
    video_url?: string | null;
    is_popular: boolean | null;
    characteristics?: Record<string, any> | null;
    short_description?: string | null;
}

interface KorsarAlternativeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
}

export function KorsarAlternativeModal({ open, onOpenChange, product }: KorsarAlternativeModalProps) {
    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-orange-800">
                        Ищете «Корсар»? У нас есть вариант лучше!
                    </DialogTitle>
                </DialogHeader>
                
                <div className="mt-4">
                    <p className="text-center text-gray-700 mb-4 text-base lg:text-lg font-semibold">
                        У нас нет в магазине петард «Корсар», но есть вариант мощнее!
                    </p>
                    <p className="text-center text-gray-700 mb-6 text-base lg:text-lg">
                        Представляем вам петарды «Звиздец» — проверенный выбор магазина, который не уступает «Корсару» по качеству, а по мощности часто даже превосходит его.
                    </p>
                    
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <ProductCard
                                product={product}
                                isFirst={true}
                                isAboveFold={true}
                            />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

