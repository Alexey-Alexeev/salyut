'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ActiveFiltersProps {
  categories: Category[];
  selectedCategories: string[];
  priceFrom: string;
  priceTo: string;
  onRemoveCategory: (categorySlug: string) => void;
  onClearPrice: () => void;
  onClearAll: () => void;
}

export const ActiveFilters = React.memo<ActiveFiltersProps>(
  ({
    categories,
    selectedCategories,
    priceFrom,
    priceTo,
    onRemoveCategory,
    onClearPrice,
    onClearAll,
  }) => {
    const hasActiveFilters =
      selectedCategories.length > 0 || priceFrom || priceTo;

    if (!hasActiveFilters) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedCategories.map(categorySlug => {
          const category = categories.find(c => c.slug === categorySlug);
          if (!category) return null;

          return (
            <Badge key={categorySlug} variant="secondary" className="gap-1">
              {category.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onRemoveCategory(categorySlug)}
              />
            </Badge>
          );
        })}

        {(priceFrom || priceTo) && (
          <Badge variant="secondary" className="gap-1">
            Цена: {priceFrom || '0'} - {priceTo || '∞'} ₽
            <X className="h-3 w-3 cursor-pointer" onClick={onClearPrice} />
          </Badge>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs"
        >
          Очистить все
        </Button>
      </div>
    );
  }
);

ActiveFilters.displayName = 'ActiveFilters';
