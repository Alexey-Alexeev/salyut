'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: string[];
  onCategoryChange: (categorySlug: string, checked: boolean) => void;
}

export const CategoryFilter = React.memo<CategoryFilterProps>(
  ({ categories, selectedCategories, onCategoryChange }) => {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Категории</h3>
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.slug}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={checked =>
                  onCategoryChange(category.slug, checked as boolean)
                }
                className="ym-record-keys"
              />
              <label
                htmlFor={`category-${category.slug}`}
                className="cursor-pointer text-sm leading-none"
              >
                {category.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

CategoryFilter.displayName = 'CategoryFilter';
