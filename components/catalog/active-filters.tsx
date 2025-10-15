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
  search: string;
  onRemoveCategory: (categorySlug: string) => void;
  onClearPrice: () => void;
  onClearSearch: () => void;
  onClearAll: () => void;
}

export const ActiveFilters = React.memo<ActiveFiltersProps>(
  ({
    categories,
    selectedCategories,
    priceFrom,
    priceTo,
    search,
    onRemoveCategory,
    onClearPrice,
    onClearSearch,
    onClearAll,
  }) => {
    const hasActiveFilters =
      selectedCategories.length > 0 || priceFrom || priceTo || search;

    if (!hasActiveFilters) return null;

    return (
      <div className="mb-4 flex flex-wrap gap-2">
        {selectedCategories.map(categorySlug => {
          const category = categories.find(c => c.slug === categorySlug);
          if (!category) return null;

          return (
            <Badge key={categorySlug} variant="secondary" className="gap-1">
              {category.name}
              <X
                className="size-3 cursor-pointer"
                onClick={() => onRemoveCategory(categorySlug)}
              />
            </Badge>
          );
        })}

        {search && (
          <Badge variant="secondary" className="gap-1">
            Поиск: "{search}"
            <X className="size-3 cursor-pointer" onClick={onClearSearch} />
          </Badge>
        )}

        {(priceFrom || priceTo) && (
          <Badge variant="secondary" className="gap-1">
            Цена: {priceFrom || '0'} - {priceTo || '∞'} ₽
            <X className="size-3 cursor-pointer" onClick={onClearPrice} />
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
