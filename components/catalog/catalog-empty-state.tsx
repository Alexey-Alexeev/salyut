'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConsultationDialog } from '@/components/consultation-dialog';

interface CatalogEmptyStateProps {
    onClearFilters: () => void;
}

export function CatalogEmptyState({ onClearFilters }: CatalogEmptyStateProps) {
    const [isConsultOpen, setIsConsultOpen] = useState(false);
    return (
        <div className="py-12 text-center">
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
            <ConsultationDialog open={isConsultOpen} onOpenChange={setIsConsultOpen} centerTitle />
        </div>
    );
}
