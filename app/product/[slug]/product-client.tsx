'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingCart, Minus, Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[] | null;
  description: string | null;
  short_description?: string | null;
  characteristics: Record<string, any> | null;
  is_popular: boolean | null;
  manufacturer_id?: string | null;
  category_id?: string | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type Manufacturer = {
  id: string;
  name: string;
  country?: string | null;
  description?: string | null;
};

interface ProductClientProps {
  product: Product;
  category?: Category | null;
  manufacturer?: Manufacturer | null;
}

export default function ProductClient({
  product,
  category,
  manufacturer,
}: ProductClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0] || '',
      });
    }
    toast.success(`${quantity} товар(ов) добавлено в корзину`);
    setQuantity(1);
  };

  const images = product.images || [];
  console.log('product', product);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { href: '/catalog', label: 'Каталог' },
            { label: product.name },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border">
            {images[0] && (
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`flex-shrink-0 w-20 h-20 relative rounded-lg border-2 overflow-hidden transition-all ${
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.is_popular && (
                <Badge className="bg-orange-500">Популярный</Badge>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold mb-4">
              {product.name}
            </h1>

            <div className="text-3xl font-bold text-primary mb-6">
              {product.price.toLocaleString('ru-RU')} ₽
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Количество:</span>
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button onClick={handleAddToCart} size="lg" className="w-full">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Добавить в корзину •{' '}
              {(product.price * quantity).toLocaleString('ru-RU')} ₽
            </Button>

            {product.short_description && (
              <div className="text-sm text-muted-foreground">
                {product.short_description}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {manufacturer && (
                <div>
                  <span className="text-muted-foreground">Производитель:</span>
                  <br />
                  <span className="font-medium">{manufacturer.name}</span>
                </div>
              )}
              {category && (
                <div>
                  <span className="text-muted-foreground">Категория:</span>
                  <br />
                  <span className="font-medium">{category.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description">Описание</TabsTrigger>
            <TabsTrigger value="characteristics">Характеристики</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || 'Описание товара отсутствует.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="characteristics" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                {product.characteristics &&
                Object.keys(product.characteristics).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.characteristics).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-2 border-b border-border/50"
                        >
                          <span className="font-medium">{key}:</span>
                          <span className="text-muted-foreground">
                            {String(value)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Характеристики товара отсутствуют.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
