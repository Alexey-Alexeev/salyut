'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useCartStore } from '@/lib/cart-store'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  images: string[] | null
  is_popular?: boolean | null
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [isMounted, setIsMounted] = useState(false)

  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)

  // Синхронизируем локальное состояние с глобальным после монтирования
  useEffect(() => {
    setIsMounted(true)
    const cartItem = items.find(item => item.id === product.id)
    const newQuantity = cartItem?.quantity || 0
    setQuantity(newQuantity)
    setInputValue(newQuantity.toString())
  }, [items, product.id])

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder-product.jpg'
    })
    setQuantity(1)
    setInputValue('1')
    toast.success('Товар добавлен в корзину')
  }

  const handleIncrease = () => {
    if (quantity === 0) {
      handleAddToCart()
    } else {
      const newQuantity = quantity + 1
      updateQuantity(product.id, newQuantity)
      setQuantity(newQuantity)
      setInputValue(newQuantity.toString())
    }
  }

  const handleDecrease = () => {
    if (quantity === 1) {
      handleRemoveCompletely()
    } else if (quantity > 1) {
      const newQuantity = quantity - 1
      updateQuantity(product.id, newQuantity)
      setQuantity(newQuantity)
      setInputValue(newQuantity.toString())
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Разрешаем только цифры и пустую строку
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value) || 0

      // Ограничиваем максимальное значение (например, 999)
      if (numValue > 999) {
        setInputValue('999')
        return
      }

      setInputValue(value)
    }
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const numValue = parseInt(inputValue) || 0

    if (numValue === 0) {
      handleRemoveCompletely()
    } else if (numValue > 0) {
      if (quantity === 0) {
        // Добавляем товар если его не было в корзине
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '/placeholder-product.jpg'
          // quantity не нужен, т.к. addItem по умолчанию добавляет 1 штуку
        })
        // Но нам нужно установить нужное количество
        // Поэтому после добавления обновляем количество
        updateQuantity(product.id, numValue)
      } else {
        // Обновляем количество существующего товара
        updateQuantity(product.id, numValue)
      }
      setQuantity(numValue)
      setInputValue(numValue.toString())
    } else {
      // Если ввели 0 или невалидное значение, восстанавливаем предыдущее
      setInputValue(quantity.toString())
    }
  }

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
  }

  const handleRemoveCompletely = () => {
    removeItem(product.id)
    setQuantity(0)
    setInputValue('0')
    toast.info('Товар удален из корзины')
  }

  // Не рендерим до монтирования, чтобы избежать hydration mismatch
  if (!isMounted) {
    return (
        <Card className="overflow-hidden">
          <div className="aspect-square relative bg-muted animate-pulse" />
          <CardContent className="p-4">
            <div className="h-4 bg-muted rounded animate-pulse mb-2" />
            <div className="h-6 bg-muted rounded animate-pulse w-1/2" />
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="h-9 bg-muted rounded animate-pulse w-full" />
          </CardFooter>
        </Card>
    )
  }

  return (
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg">
        <div className="relative">
          <Link href={`/product/${product.slug}`}>
            <div className="aspect-square relative overflow-hidden">
              <Image
                  src={product.images?.[0] || '/placeholder-product.jpg'}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </Link>
          {product.is_popular && (
              <Badge className="absolute top-2 left-2 bg-orange-500">
                Популярный
              </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-lg font-bold text-primary">
            {(product.price).toLocaleString('ru-RU')} ₽
          </p>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          {quantity > 0 ? (
              <div className="flex items-center justify-between w-full gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDecrease}
                    className="h-9 w-9 p-0"
                >
                  {quantity === 1 ? (
                      <Trash2 className="h-4 w-4 text-destructive" />
                  ) : (
                      <Minus className="h-4 w-4" />
                  )}
                </Button>

                <Input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyPress={handleInputKeyPress}
                    className="w-16 h-9 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    inputMode="numeric"
                    pattern="[0-9]*"
                />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleIncrease}
                    className="h-9 w-9 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
          ) : (
              <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  size="sm"
                  variant="default"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                В корзину
              </Button>
          )}
        </CardFooter>
      </Card>
  )
}