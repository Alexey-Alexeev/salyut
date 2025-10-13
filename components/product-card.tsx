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

// Типы поддерживаемых видео платформ
type VideoPlatform = 'rutube' | 'vk' | 'youtube' | 'unknown';

// Интерфейс для информации о видео
interface VideoInfo {
  platform: VideoPlatform;
  videoId: string | null;
  embedUrl: string | null;
}

// Универсальная функция для определения типа видео и извлечения ID
function getVideoInfo(url: string): VideoInfo {
  if (!url) return { platform: 'unknown', videoId: null, embedUrl: null };

  // Rutube
  const rutubePatterns = [
    /rutube\.ru\/video\/([a-zA-Z0-9]+)(?:\/.*)?/,
    /rutube\.ru\/play\/embed\/([a-zA-Z0-9]+)(?:\/.*)?/,
    /rutube\.ru\/video\/private\/([a-zA-Z0-9]+)(?:\/.*)?/
  ];

  for (const pattern of rutubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform: 'rutube',
        videoId: match[1],
        embedUrl: `https://rutube.ru/play/embed/${match[1]}`
      };
    }
  }

  // VK Video
  const vkPatterns = [
    /vk\.com\/video(-?\d+_\d+)/,
    /vkvideo\.ru\/video(-?\d+_\d+)/,
    /vk\.com\/video\?z=video(-?\d+_\d+)/
  ];

  for (const pattern of vkPatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform: 'vk',
        videoId: match[1],
        embedUrl: `https://vk.com/video_ext.php?oid=${match[1].split('_')[0]}&id=${match[1].split('_')[1]}&hd=2`
      };
    }
  }

  // YouTube
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]+)/
  ];

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        platform: 'youtube',
        videoId: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}`
      };
    }
  }

  return { platform: 'unknown', videoId: null, embedUrl: null };
}

// Функция для извлечения ключевых характеристик с названиями
function getKeyCharacteristics(characteristics: Record<string, any> | null): Array<{ label: string, value: string }> {
  if (!characteristics) return [];

  // Приоритетные поля с их весами
  const priorityFields = [
    { pattern: /залпов?|выстрелов?/i, weight: 10 },
    { pattern: /секунд?|длительность/i, weight: 9 },
    { pattern: /эффектов?/i, weight: 8 },
    { pattern: /калибр/i, weight: 7 },
    { pattern: /размер/i, weight: 6 },
    { pattern: /вес/i, weight: 5 },
    { pattern: /тип/i, weight: 4 },
    { pattern: /высота/i, weight: 3 },
    { pattern: /диаметр/i, weight: 3 },
    { pattern: /цвет/i, weight: 2 },
    { pattern: /материал/i, weight: 2 }
  ];

  const highlights: Array<{ label: string; value: string; weight: number }> = [];

  for (const [key, value] of Object.entries(characteristics)) {
    if (value && typeof value === 'string' && value.trim()) {
      // Находим приоритет для этого поля
      const priority = priorityFields.find(field =>
        field.pattern.test(key)
      );

      if (priority) {
        highlights.push({
          label: key,
          value: value.trim(),
          weight: priority.weight
        });
      }
    }
  }

  // Сортируем по приоритету и возвращаем все характеристики
  return highlights
    .sort((a, b) => b.weight - a.weight)
    .map(item => ({ label: item.label, value: item.value }));
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[] | null;
  video_url?: string | null;
  is_popular?: boolean | null;
  characteristics?: Record<string, any> | null;
  short_description?: string | null;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const items = useCartStore(state => state.items);
  const isInitialized = useCartStore(state => state.isInitialized);
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

  // Не рендерим до монтирования и инициализации store, чтобы избежать hydration mismatch
  if (!isMounted || !isInitialized) {
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
            ) : product.video_url ? (() => {
              const videoInfo = getVideoInfo(product.video_url);
              return videoInfo.embedUrl ? (
                <iframe
                  src={videoInfo.embedUrl}
                  title={product.name}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  allow="clipboard-write; autoplay"
                  allowFullScreen
                  frameBorder="0"
                  style={{ border: 'none' }}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4 text-center">
                  <div className="mb-3 text-4xl opacity-50">🎬</div>
                  <div className="text-sm font-medium text-gray-600 line-clamp-2">
                    {product.name}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Видео недоступно
                  </div>
                </div>
              );
            })() : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4 text-center">
                <div className="mb-3 text-4xl opacity-50">📷</div>
                <div className="text-sm font-medium text-gray-600 line-clamp-2">
                  {product.name}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  Фото отсутствует
                </div>
              </div>
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

        {/* Характеристики */}
        {product.characteristics && (() => {
          const characteristics = getKeyCharacteristics(product.characteristics);
          return characteristics.length > 0 && (
            <div className="mb-3">
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {characteristics.map((char, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 font-medium truncate mr-2">{char.label}:</span>
                    <span className="text-gray-900 font-semibold flex-shrink-0">{char.value}</span>
                  </div>
                ))}
              </div>
              {characteristics.length > 4 && (
                <div className="text-xs text-gray-500 mt-1 text-center">
                  +{characteristics.length - 4} характеристик
                </div>
              )}
            </div>
          );
        })()}


        <div className="mt-auto">
          <p className="text-primary text-lg font-bold text-right">
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
