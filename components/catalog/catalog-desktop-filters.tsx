import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface CatalogDesktopFiltersProps {
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

export function CatalogDesktopFilters({
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
}: CatalogDesktopFiltersProps) {
    return (
        <div className="hidden w-64 shrink-0 lg:block">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="size-5" />
                        Фильтры
                    </CardTitle>
                </CardHeader>
                <CardContent>
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
                        />

                        <PriceRangeFilter
                            priceFrom={priceFrom}
                            priceTo={priceTo}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                            onPriceChange={onPriceChange}
                            onPriceFromChange={onPriceFromChange}
                            onPriceToChange={onPriceToChange}
                        />
                    </div>
                    <Button
                        onClick={() => {
                            // Применяем все фильтры - они уже применяются автоматически через debouncing,
                            // но кнопка может быть полезна для явного применения
                            onPriceChange(priceFrom, priceTo);
                            onShotsChange(shotsFrom, shotsTo);
                        }}
                        className="mt-4 h-9 w-full text-sm"
                        size="sm"
                    >
                        Применить фильтр
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

