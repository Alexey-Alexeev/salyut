'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

// Функция для извлечения ID видео из Rutube
function getRutubeVideoId(url: string): string | null {
  if (!url) return null;

  // Поддерживаем различные форматы Rutube URL
  const patterns = [
    /rutube\.ru\/video\/([a-zA-Z0-9]+)/,
    /rutube\.ru\/play\/embed\/([a-zA-Z0-9]+)/,
    /rutube\.ru\/video\/private\/([a-zA-Z0-9]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[] | null;
  video_url?: string | null;
  is_popular?: boolean | null;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const items = useCartStore(state => state.items);
  const addItem = useCartStore(state => state.addItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);

  // Синхронизируем локальное состояние с глобальным после монтирования
  useEffect(() => {
    setIsMounted(true);
    const cartItem = items.find(item => item.id === product.id);
    const newQuantity = cartItem?.quantity || 0;
    setQuantity(newQuantity);
    setInputValue(newQuantity.toString());
  }, [items, product.id]);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/placeholder-product.jpg',
    });
    setQuantity(1);
    setInputValue('1');
    toast.success('Товар добавлен в корзину');
  };

  const handleIncrease = () => {
    if (quantity === 0) {
      handleAddToCart();
    } else {
      const newQuantity = quantity + 1;
      updateQuantity(product.id, newQuantity);
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
    }
  };

  const handleDecrease = () => {
    if (quantity === 1) {
      handleRemoveCompletely();
    } else if (quantity > 1) {
      const newQuantity = quantity - 1;
      updateQuantity(product.id, newQuantity);
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Разрешаем только цифры и пустую строку
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = parseInt(value) || 0;

      // Ограничиваем максимальное значение (например, 999)
      if (numValue > 999) {
        setInputValue('999');
        return;
      }

      setInputValue(value);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const numValue = parseInt(inputValue) || 0;

    if (numValue === 0) {
      handleRemoveCompletely();
    } else if (numValue > 0) {
      if (quantity === 0) {
        // Добавляем товар если его не было в корзине
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '/placeholder-product.jpg',
          // quantity не нужен, т.к. addItem по умолчанию добавляет 1 штуку
        });
        // Но нам нужно установить нужное количество
        // Поэтому после добавления обновляем количество
        updateQuantity(product.id, numValue);
      } else {
        // Обновляем количество существующего товара
        updateQuantity(product.id, numValue);
      }
      setQuantity(numValue);
      setInputValue(numValue.toString());
    } else {
      // Если ввели 0 или невалидное значение, восстанавливаем предыдущее
      setInputValue(quantity.toString());
    }
  };

  const handleInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleRemoveCompletely = () => {
    removeItem(product.id);
    setQuantity(0);
    setInputValue('0');
    toast.info('Товар удален из корзины');
  };

  // Не рендерим до монтирования, чтобы избежать hydration mismatch
  if (!isMounted) {
    return (
      <Card className="overflow-hidden">
        <div className="bg-muted relative aspect-square animate-pulse" />
        <CardContent className="p-4">
          <div className="bg-muted mb-2 h-4 animate-pulse rounded" />
          <div className="bg-muted h-6 w-1/2 animate-pulse rounded" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="bg-muted h-9 w-full animate-pulse rounded" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
      <div className="relative">
        <Link href={`/product/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNncmFkKSIvPjwvc3ZnPg=="
              />
            ) : product.video_url ? (
              <iframe
                src={`https://rutube.ru/play/embed/${getRutubeVideoId(product.video_url)}`}
                title={product.name}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Image
                src="/placeholder-product.jpg"
                alt={product.name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNncmFkKSIvPjwvc3ZnPg=="
              />
            )}
          </div>
        </Link>
        {product.is_popular && (
          <Badge className="absolute left-2 top-2 rounded bg-orange-700 px-2 py-1 font-semibold text-white shadow-md">
            Популярный
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="group-hover:text-primary mb-2 min-h-[2.5rem] line-clamp-2 text-sm font-medium transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-auto">
          <p className="text-primary text-lg font-bold">
            {product.price.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {quantity > 0 ? (
          <div className="flex w-full items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecrease}
              className="size-9 p-0"
              aria-label={
                quantity === 1
                  ? 'Удалить товар из корзины'
                  : 'Уменьшить количество'
              }
            >
              {quantity === 1 ? (
                <Trash2
                  className="text-destructive size-4"
                  aria-hidden="true"
                />
              ) : (
                <Minus className="size-4" aria-hidden="true" />
              )}
            </Button>

            <Input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleInputKeyPress}
              className="h-10 w-20 text-center text-base [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Количество товара"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={handleIncrease}
              className="size-9 p-0"
              aria-label="Увеличить количество"
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            className="w-full"
            size="sm"
            variant="default"
          >
            <ShoppingCart className="mr-2 size-4" />В корзину
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
