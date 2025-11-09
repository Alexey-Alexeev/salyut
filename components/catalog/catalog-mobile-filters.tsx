import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Filter } from 'lucide-react';
import { CategoryFilter } from './category-filter';
import { PriceRangeFilter } from './price-range-filter';
import { ShotsRangeFilter } from './shots-range-filter';
import { EventTypeFilter } from './event-type-filter';
import { type EventType } from '@/lib/schema-constants';

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface CatalogMobileFiltersProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    selectedCategories: string[];
    priceFrom: string;
    priceTo: string;
    minPrice: number;
    maxPrice: number;
    shotsFrom: string;
    shotsTo: string;
    minShots: number;
    maxShots: number;
    onCategoryChange: (categorySlug: string, checked: boolean) => void;
    onPriceChange: (from: string, to: string) => void;
    onPriceFromChange?: (value: string) => void;
    onPriceToChange?: (value: string) => void;
    onShotsChange: (from: string, to: string) => void;
    onShotsFromChange?: (value: string) => void;
    onShotsToChange?: (value: string) => void;
    selectedEventType: EventType | null;
    onEventTypeChange: (eventType: EventType | null) => void;
}

export function CatalogMobileFilters({
    isOpen,
    onOpenChange,
    categories,
    selectedCategories,
    priceFrom,
    priceTo,
    minPrice,
    maxPrice,
    shotsFrom,
    shotsTo,
    minShots,
    maxShots,
    onCategoryChange,
    onPriceChange,
    onPriceFromChange,
    onPriceToChange,
    onShotsChange,
    onShotsFromChange,
    onShotsToChange,
    selectedEventType,
    onEventTypeChange,
}: CatalogMobileFiltersProps) {
    // Суммарное количество выбранных фильтров: все категории + 1 если цена + 1 если залпы + 1 если событие
    const filtersCount = selectedCategories.length + ((priceFrom || priceTo) ? 1 : 0) + ((shotsFrom || shotsTo) ? 1 : 0) + (selectedEventType ? 1 : 0);

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative font-medium">
                    <span className="flex items-center gap-1">
                        <Filter className="mr-1 size-4" />
                        Показать фильтры
                        {filtersCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center bg-orange-500 text-white rounded-full w-5 h-5 text-xs font-bold">{filtersCount}</span>
                        )}
                    </span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
                <SheetHeader>
                    <SheetTitle>Фильтры</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                    <div className="space-y-6">
                        <CategoryFilter
                            categories={categories}
                            selectedCategories={selectedCategories}
                            onCategoryChange={onCategoryChange}
                        />
                        <EventTypeFilter
                            selectedEventType={selectedEventType}
                            onEventTypeChange={onEventTypeChange}
                        />
                        <ShotsRangeFilter
                            shotsFrom={shotsFrom}
                            shotsTo={shotsTo}
                            minShots={minShots}
                            maxShots={maxShots}
                            onShotsChange={onShotsChange}
                            onShotsFromChange={onShotsFromChange}
                            onShotsToChange={onShotsToChange}
                            onMobileFilterClose={() => onOpenChange(false)}
                        />
                        <PriceRangeFilter
                            priceFrom={priceFrom}
                            priceTo={priceTo}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            onPriceChange={onPriceChange}
                            onPriceFromChange={onPriceFromChange}
                            onPriceToChange={onPriceToChange}
                            onMobileFilterClose={() => onOpenChange(false)}
                        />
                    </div>
                    <Button
                        onClick={() => {
                            // Применяем все фильтры - они уже применяются автоматически через debouncing,
                            // но кнопка явно применяет и закрывает мобильное меню
                            onPriceChange(priceFrom, priceTo);
                            onShotsChange(shotsFrom, shotsTo);
                            onOpenChange(false);
                        }}
                        className="mt-6 h-10 w-full text-sm"
                        size="sm"
                    >
                        Применить фильтр
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
