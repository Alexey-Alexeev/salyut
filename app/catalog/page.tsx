'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Filter, Grid, List } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Типы для данных из БД
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

function CatalogContent() {
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  // Загружаем данные из БД
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/products')
        ])
        
        if (categoriesRes.ok && productsRes.ok) {
          const [categoriesData, productsData] = await Promise.all([
            categoriesRes.json(),
            productsRes.json()
          ])
          
          setCategories(categoriesData)
          setProducts(productsData)
          setFilteredProducts(productsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setSelectedCategories([categoryParam])
    }
  }, [searchParams])

  // Filter products
  useEffect(() => {
    let filtered = products

    // Filter by categories
    if (selectedCategories.length > 0) {
      const categoryIds = categories
        .filter(cat => selectedCategories.includes(cat.slug))
        .map(cat => cat.id)
      filtered = filtered.filter(product => categoryIds.includes(product.category_id || ''))
    }

    // Filter by price
    filtered = filtered.filter(product => 
      (product.price / 100) >= priceRange[0] && (product.price / 100) <= priceRange[1]
    )

    // Sort products
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
  }, [products, categories, selectedCategories, priceRange, sortBy])

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    setSelectedCategories(prev => 
      checked 
        ? [...prev, categorySlug]
        : prev.filter(slug => slug !== categorySlug)
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Загрузка...</div>
      </div>
    )
  }

  const FilterSection = () => (
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-4">Категории</h3>
          <div className="space-y-3">
            {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                      id={`category-${category.slug}`}
                      checked={selectedCategories.includes(category.slug)}
                      onCheckedChange={(checked) =>
                          handleCategoryChange(category.slug, checked as boolean)
                      }
                  />
                  <label
                      htmlFor={`category-${category.slug}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.name}
                  </label>
                </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Цена, ₽</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="price-from" className="text-xs font-medium text-muted-foreground">
                  От
                </Label>
                <Input
                    id="price-from"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={priceRange[0] === 0 ? '' : priceRange[0]}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value, 10)
                      if (isNaN(value) || value < 0) return
                      setPriceRange(prev => [value, prev[1]])
                    }}
                    className="h-9 text-sm"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="price-to" className="text-xs font-medium text-muted-foreground">
                  До
                </Label>
                <Input
                    id="price-to"
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={priceRange[1] === 5000 ? '' : priceRange[1]}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 5000 : parseInt(e.target.value, 10)
                      if (isNaN(value) || value < 0) return
                      setPriceRange(prev => [prev[0], value])
                    }}
                    className="h-9 text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {priceRange[0] > 0 || priceRange[1] < 5000
                  ? `${priceRange[0]} ₽ — ${priceRange[1]} ₽`
                  : 'Любая цена'}
            </p>
          </div>
        </div>
      </div>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Каталог товаров' }
        ]}
        className="mb-8"
      />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Filters */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Фильтры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilterSection />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Mobile Filter & Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <Filter className="h-4 w-4 mr-2" />
                    Фильтры
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Фильтры</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FilterSection />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Найдено: {filteredProducts.length} товаров
              </span>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Сортировать" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="price-asc">Сначала дешевые</SelectItem>
                  <SelectItem value="price-desc">Сначала дорогие</SelectItem>
                  <SelectItem value="popular">Популярные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          <div className={`grid gap-4 ${
            viewMode === 'grid' 
              ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                По выбранным фильтрам ничего не найдено
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedCategories([])
                  setPriceRange([0, 5000])
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <CatalogContent />
    </Suspense>
  )
}