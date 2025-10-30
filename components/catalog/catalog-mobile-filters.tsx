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
    onCategoryChange: (categorySlug: string, checked: boolean) => void;
    onPriceChange: (from: string, to: string) => void;
    onPriceFromChange?: (value: string) => void;
    onPriceToChange?: (value: string) => void;
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
    onCategoryChange,
    onPriceChange,
    onPriceFromChange,
    onPriceToChange,
}: CatalogMobileFiltersProps) {
    // Суммарное количество выбранных фильтров: все категории + 1 если цена
    const filtersCount = selectedCategories.length + ((priceFrom || priceTo) ? 1 : 0);

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
                </div>
            </SheetContent>
        </Sheet>
    );
}

