'use client'

import React, { useState, useEffect, Suspense, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Grid, List } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { PriceRangeFilter } from '@/components/catalog/price-range-filter'
import { CategoryFilter } from '@/components/catalog/category-filter'
import { ActiveFilters } from '@/components/catalog/active-filters'

// Типы
interface Category {
  id: string
  name: string
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  price: number
  category_id: string | null
  images: string[] | null
  is_popular: boolean | null
}

interface FilterState {
  categories: string[]
  priceFrom: string
  priceTo: string
  priceMin: number
  priceMax: number
}



function CatalogContent() {
  const searchParams = useSearchParams()
  
  // Основное состояние
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // Состояние фильтров
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceFrom: '',
    priceTo: '',
    priceMin: 0,
    priceMax: 10000
  })
  
  // Состояние интерфейса
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products'),
        ])

        if (categoriesRes.ok && productsRes.ok) {
          const [categoriesData, productsData] = await Promise.all([
            categoriesRes.json(),
            productsRes.json(),
          ])

          setCategories(categoriesData)
          setProducts(productsData)

          // Определяем диапазон цен
          const prices = productsData.map((p: Product) => p.price)
          const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000
          
          setFilters(prev => ({
            ...prev,
            priceMax: maxPrice
          }))
          
          setFilteredProducts(productsData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Инициализация фильтров из URL
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setFilters(prev => ({
        ...prev,
        categories: [categoryParam]
      }))
    }
  }, [searchParams])

  // Применение фильтров
  const applyFilters = useCallback(() => {
    let filtered = [...products]

    // Фильтр по категориям
    if (filters.categories.length > 0) {
      const categoryIds = categories
        .filter((cat) => filters.categories.includes(cat.slug))
        .map((cat) => cat.id)
      filtered = filtered.filter((product) => 
        categoryIds.includes(product.category_id || '')
      )
    }

    // Фильтр по цене
    const minPrice = filters.priceFrom ? parseInt(filters.priceFrom) : filters.priceMin
    const maxPrice = filters.priceTo ? parseInt(filters.priceTo) : filters.priceMax
    
    filtered = filtered.filter((product) => 
      product.price >= minPrice && product.price <= maxPrice
    )

    // Сортировка
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'popular':
          return (b.is_popular ? 1 : 0) - (a.is_popular ? 1 : 0)
        default:
          return a.name.localeCompare(b.name, 'ru')
      }
    })

    setFilteredProducts(filtered)
  }, [products, categories, filters, sortBy])

  // Применяем фильтры при изменении
  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  // Обработчики событий
  const handleCategoryChange = useCallback((categorySlug: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      categories: checked 
        ? [...prev.categories, categorySlug]
        : prev.categories.filter(slug => slug !== categorySlug)
    }))
  }, [])

  const handlePriceChange = useCallback((from: string, to: string) => {
    setFilters(prev => ({
      ...prev,
      priceFrom: from,
      priceTo: to
    }))
  }, [])

  const handleRemoveCategory = useCallback((categorySlug: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.filter(slug => slug !== categorySlug)
    }))
  }, [])

  const handleClearPrice = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      priceFrom: '',
      priceTo: ''
    }))
  }, [])

  const handleClearAllFilters = useCallback(() => {
    setFilters({
      categories: [],
      priceFrom: '',
      priceTo: '',
      priceMin: 0,
      priceMax: filters.priceMax
    })
  }, [filters.priceMax])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка каталога...</div>
      </div>
    )
  }

  const FiltersContent = ({ onMobileClose }: { onMobileClose?: () => void }) => (
    <div className="space-y-6">
      <CategoryFilter
        categories={categories}
        selectedCategories={filters.categories}
        onCategoryChange={handleCategoryChange}
      />
      
      <PriceRangeFilter
        priceFrom={filters.priceFrom}
        priceTo={filters.priceTo}
        minPrice={filters.priceMin}
        maxPrice={filters.priceMax}
        onPriceChange={handlePriceChange}
        onApplyFilter={applyFilters}
        onMobileFilterClose={onMobileClose}
      />
    </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={[{ label: 'Каталог товаров' }]} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Фильтры для десктопа */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FiltersContent />
            </CardContent>
          </Card>
        </div>

        {/* Основной контент */}
        <div className="flex-1">
          {/* Мобильные фильтры и управление */}
          <div className="flex flex-col gap-4 mb-6">
            {/* Мобильные фильтры */}
            <div className="flex justify-between items-center lg:hidden">
              <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Фильтры
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Фильтры</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent onMobileClose={() => setIsMobileFiltersOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-9 w-9 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-9 w-9 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Управление для десктопа */}
            <div className="hidden lg:flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Найдено: {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : 'товаров'}
              </span>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-9 w-9 p-0"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-9 w-9 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44 h-9">
                    <SelectValue placeholder="Сортировка" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">По названию</SelectItem>
                    <SelectItem value="price-asc">Сначала дешёвые</SelectItem>
                    <SelectItem value="price-desc">Сначала дорогие</SelectItem>
                    <SelectItem value="popular">Популярные</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Счетчик и сортировка для мобильных */}
            <div className="flex justify-between items-center lg:hidden">
              <span className="text-sm text-muted-foreground">
                Найдено: {filteredProducts.length}
              </span>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="price-asc">Дешёвые</SelectItem>
                  <SelectItem value="price-desc">Дорогие</SelectItem>
                  <SelectItem value="popular">Популярные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Активные фильтры */}
          <ActiveFilters
            categories={categories}
            selectedCategories={filters.categories}
            priceFrom={filters.priceFrom}
            priceTo={filters.priceTo}
            onRemoveCategory={handleRemoveCategory}
            onClearPrice={handleClearPrice}
            onClearAll={handleClearAllFilters}
          />

          {/* Сетка товаров */}
          <div
            className={`grid gap-4 ${
              viewMode === 'grid'
                ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Сообщение о пустых результатах */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                По выбранным фильтрам ничего не найдено
              </p>
              <Button variant="outline" onClick={handleClearAllFilters}>
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Экспорт страницы с Suspense
export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Загрузка...</div>}>
      <CatalogContent />
    </Suspense>
  )
}
