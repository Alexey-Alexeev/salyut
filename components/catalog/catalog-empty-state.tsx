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
        <div className="py-12">
            {/* Блок "По выбранным параметрам ничего не найдено" - всегда показываем */}
            <div className="text-center mb-8">
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

            {/* Блок "Возможно вы имели в виду" - всегда показываем, меньше по размеру */}
            <div className="mt-8">
                <h3 className="mb-4 text-center text-lg font-semibold">
                    Возможно Вы имели в виду
                </h3>
                {similarProducts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        {similarProducts.map((product, index) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isFirst={index === 0}
                                isAboveFold={index < 3}
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
            
            <ConsultationDialog open={isConsultOpen} onOpenChange={setIsConsultOpen} centerTitle />
        </div>
    );
}
