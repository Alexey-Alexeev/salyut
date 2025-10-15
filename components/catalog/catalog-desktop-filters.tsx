import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import { CategoryFilter } from './category-filter';
import { PriceRangeFilter } from './price-range-filter';

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
    onCategoryChange: (categorySlug: string, checked: boolean) => void;
    onPriceChange: (from: string, to: string) => void;
    onPriceFromChange?: (value: string) => void;
    onPriceToChange?: (value: string) => void;
}

export function CatalogDesktopFilters({
    categories,
    selectedCategories,
    priceFrom,
    priceTo,
    minPrice,
    maxPrice,
    onCategoryChange,
    onPriceChange,
    onPriceFromChange,
    onPriceToChange,
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
                </CardContent>
            </Card>
        </div>
    );
}

