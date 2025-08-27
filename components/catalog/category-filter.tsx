'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'

interface Category {
  id: string
  name: string
  slug: string
}

interface CategoryFilterProps {
  categories: Category[]
  selectedCategories: string[]
  onCategoryChange: (categorySlug: string, checked: boolean) => void
}

export const CategoryFilter = React.memo<CategoryFilterProps>(({ 
  categories, 
  selectedCategories, 
  onCategoryChange 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Категории</h3>
      <div className="space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <Checkbox
              id={`category-${category.slug}`}
              checked={selectedCategories.includes(category.slug)}
              onCheckedChange={(checked) =>
                onCategoryChange(category.slug, checked as boolean)
              }
            />
            <label
              htmlFor={`category-${category.slug}`}
              className="text-sm leading-none cursor-pointer"
            >
              {category.name}
            </label>
          </div>
        ))}
      </div>
    </div>
  )
})

CategoryFilter.displayName = 'CategoryFilter'