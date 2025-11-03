'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConsultationDialog } from '@/components/consultation-dialog';
import { ProductCard } from '@/components/product-card';
import { MessageCircle } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[] | null;
    video_url?: string | null;
    is_popular?: boolean | null;
    characteristics?: Record<string, any> | null;
    short_description?: string | null;
}

interface CatalogEmptyStateProps {
    onClearFilters: () => void;
    similarProducts?: Product[];
    searchQuery?: string;
}

export function CatalogEmptyState({ onClearFilters, similarProducts = [], searchQuery }: CatalogEmptyStateProps) {
    const [isConsultOpen, setIsConsultOpen] = useState(false);
    const hasSimilarProducts = similarProducts.length > 0;

    return (
        <div className="pt-[14px] md:pt-[22px] pb-12">
            {/* Блок "Возможно вы имели в виду" - показываем первым, компактный на десктопе */}
            <div className="mb-8 rounded-lg border-2 border-orange-200 bg-orange-50/30 p-4 md:p-3 md:max-w-2xl md:mx-auto shadow-sm">
                <h3 className="mb-3 md:mb-2 text-center text-lg md:text-base font-semibold text-orange-900">
                    Возможно Вы имели в виду
                </h3>
                {similarProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                        {similarProducts.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isFirst={index === 0}
                                isAboveFold={index < 2}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">
                            Загрузка товаров...
                        </p>
                    </div>
                )}
            </div>

            {/* Блок "По выбранным параметрам ничего не найдено" - показываем вторым */}
            <div className="text-center">
                <div className="mx-auto max-w-2xl space-y-3">
                    <p className="text-muted-foreground">
                        По выбранным параметрам ничего не найдено.
                    </p>
                    <p className="text-gray-700">
                        На сайте представлены не все товары. Можете связаться с нами — мы сможем Вам помочь и подобрать нужный вариант.
                    </p>
                </div>
                <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button variant="default" onClick={() => setIsConsultOpen(true)}>
                        Получить бесплатную консультацию
                    </Button>
                    <Button variant="outline" onClick={onClearFilters}>
                        Сбросить фильтры
                    </Button>
                </div>
            </div>
            
            <ConsultationDialog open={isConsultOpen} onOpenChange={setIsConsultOpen} centerTitle />
        </div>
    );
}
