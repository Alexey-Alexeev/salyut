'use client'

import React, {useState, useEffect, Suspense} from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductCard } from '@/components/product-card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter, Grid, List } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  price: number // в копейках
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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]) // в рублях
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)

  // 🔼 Поднятое состояние для инпутов
  const [fromValue, setFromValue] = useState<string>('')
  const [toValue, setToValue] = useState<string>('')

  // Форматирование чисел: 12500 → "12 500"
  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

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

          const pricesInRubles = productsData.map((p: Product) => p.price)
          const maxPrice = pricesInRubles.length > 0 ? Math.max(...pricesInRubles) : 5000


          setPriceRange([0, maxPrice])
          setFromValue('')
          setToValue('')
          setFilteredProducts(productsData)
        }
      } catch (error) {
        setPriceRange([0, 5000])
        setFromValue('')
        setToValue('')
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
      setSelectedCategories([categoryParam])
    }
  }, [searchParams])

  // Обработчик сброса фильтров
  const handleResetFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, priceRange[1]]) // сохраняем актуальный максимум
    setFromValue('')
    setToValue('')
  }

  // Фильтрация и сортировка
  useEffect(() => {
    let filtered = [...products]

    // Фильтр по категориям
    if (selectedCategories.length > 0) {
      const categoryIds = categories
          .filter((cat) => selectedCategories.includes(cat.slug))
          .map((cat) => cat.id)
      filtered = filtered.filter((product) => categoryIds.includes(product.category_id || ''))
    }

    // Фильтр по цене (в рублях)
    filtered = filtered.filter((product) => {
      const priceInRubles = product.price
      return priceInRubles >= priceRange[0] && priceInRubles <= priceRange[1]
    })

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
  }, [products, categories, selectedCategories, priceRange, sortBy])

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    setSelectedCategories((prev) =>
        checked ? [...prev, categorySlug] : prev.filter((slug) => slug !== categorySlug)
    )
  }

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Загрузка каталога...</div>
        </div>
    )
  }

  // --- Компонент фильтров ---
  const FilterSection = React.memo(() => {
    const applyPriceFilter = () => {
      const numFrom = fromValue === '' || isNaN(parseInt(fromValue)) ? 0 : Math.max(0, parseInt(fromValue))
      const numTo = toValue === '' || isNaN(parseInt(toValue)) ? priceRange[1] : parseInt(toValue)
      const finalTo = Math.max(numFrom, numTo)
      setPriceRange([numFrom, finalTo])
    }

    return (
        <div className="space-y-6">
          {/* Категории */}
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

          {/* Цена */}
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
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={fromValue}
                      onChange={(e) => setFromValue(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={applyPriceFilter}
                      onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
                      className="h-9 text-sm"
                      // 🔥 Добавь: не терять фокус
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="price-to" className="text-xs font-medium text-muted-foreground">
                    До
                  </Label>
                  <Input
                      id="price-to"
                      type="text"
                      inputMode="numeric"
                      placeholder={formatPrice(priceRange[1])}
                      value={toValue}
                      onChange={(e) => setToValue(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={applyPriceFilter}
                      onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
                      className="h-9 text-sm"
                      onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {fromValue || toValue ? (
                    <>
                      {fromValue || 0} ₽ — {toValue ? formatPrice(parseInt(toValue)) : formatPrice(priceRange[1])} ₽
                    </>
                ) : (
                    <>0 ₽ — {formatPrice(priceRange[1])} ₽</>
                )}
              </p>
            </div>
          </div>
        </div>
    )
  })

  return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 md:mb-1">
          <Breadcrumb items={[{label: 'Каталог товаров'}]}/>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Фильтры (десктоп) */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5"/>
                  Фильтры
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FilterSection/>
              </CardContent>
            </Card>
          </div>

          {/* Основной контент */}
          <div className="flex-1">
            {/* Мобильные фильтры и контроль */}
            <div className="flex flex-col gap-4 mb-6 mt-2 lg:mt-0"> {/* Добавил mt-4 lg:mt-0 */}
              {/* Первая строка для мобильных: Фильтры и переключатели вида */}
              <div className="flex justify-between items-center lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2"/>
                      Фильтры
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Фильтры</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterSection/>
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
                    <Grid className="h-4 w-4"/>
                  </Button>
                  <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="h-9 w-9 p-0"
                  >
                    <List className="h-4 w-4"/>
                  </Button>
                </div>
              </div>

              {/* Вторая строка для мобильных: Счетчик товаров и сортировка */}
              <div className="flex justify-between items-center lg:hidden">
          <span className="text-sm text-muted-foreground">
            Найдено: {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : 'товаров'}
          </span>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-36 h-9">
                    <SelectValue placeholder="Сортировка"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">По названию</SelectItem>
                    <SelectItem value="price-asc">Сначала дешёвые</SelectItem>
                    <SelectItem value="price-desc">Сначала дорогие</SelectItem>
                    <SelectItem value="popular">Популярные</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Одна строка для десктопа: все элементы в линию */}
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
                      <Grid className="h-4 w-4"/>
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="h-9 w-9 p-0"
                    >
                      <List className="h-4 w-4"/>
                    </Button>
                  </div>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-44 h-9">
                      <SelectValue placeholder="Сортировка"/>
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
            </div>

            {/* Сетка товаров */}
            <div
                className={`grid gap-4 ${
                    viewMode === 'grid'
                        ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                        : 'grid-cols-1'
                }`}
            >
              {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product}/>
              ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">По выбранным фильтрам ничего не найдено</p>
                  <Button variant="outline" onClick={handleResetFilters}>
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
        <CatalogContent/>
      </Suspense>
  )
}