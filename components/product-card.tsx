'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/lib/cart-store'
import { toast } from 'sonner'

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
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder-product.jpg'
    })
    toast.success('Товар добавлен в корзину')
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
          {(product.price / 100).toLocaleString('ru-RU')} ₽
        </p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={handleAddToCart}
          className="w-full" 
          size="sm"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          В корзину
        </Button>
      </CardFooter>
    </Card>
  )
}