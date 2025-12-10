'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ShoppingCart, Plus, Minus, Trash2, Play } from 'lucide-react';
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

// Функция для извлечения характеристик
function getKeyCharacteristics(characteristics: Record<string, any> | null): Array<{ label: string, value: string }> {
  if (!characteristics) return [];

  const result: Array<{ label: string; value: string }> = [];

  for (const [key, value] of Object.entries(characteristics)) {
    if (value && typeof value === 'string' && value.trim()) {
      result.push({
        label: key,
        value: value.trim()
      });
    }
  }

  return result;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  old_price?: number | null;
  images: string[] | null;
  video_url?: string | null;
  is_popular?: boolean | null;
  characteristics?: Record<string, any> | null;
  short_description?: string | null;
  category_name?: string | null;
  category_slug?: string | null;
}

interface ProductCardProps {
  product: Product;
  isFirst?: boolean;
  isAboveFold?: boolean;
  showAttentionAnimation?: boolean;
}

export function ProductCard({ product, isFirst = false, isAboveFold = false, showAttentionAnimation = false }: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const items = useCartStore(state => state.items);
  const isInitialized = useCartStore(state => state.isInitialized);
  const addItem = useCartStore(state => state.addItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const removeItem = useCartStore(state => state.removeItem);

  // Сохраняем текущий URL при монтировании, если мы на странице каталога или главной
  useEffect(() => {
    // Выполняем только после монтирования, чтобы избежать hydration mismatch
    if (isMounted && typeof window !== 'undefined') {
      try {
        if (pathname === '/catalog') {
          // Используем searchParams напрямую, без toString() в зависимостях
          const searchString = searchParams?.toString() || '';
          const currentUrl = `/catalog${searchString ? `?${searchString}` : ''}`;
          sessionStorage.setItem('catalogReturnUrl', currentUrl);
        } else if (pathname === '/') {
          sessionStorage.setItem('homeReturnUrl', '/');
        }
      } catch (error) {
        // Игнорируем ошибки sessionStorage (например, QuotaExceededError или блокировка в инкогнито)
        // Не прерываем выполнение кода, чтобы не влиять на другие компоненты
        console.warn('Не удалось сохранить URL в sessionStorage:', error);
      }
    }
    // Используем searchParams напрямую вместо toString() для стабильности зависимостей
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, pathname]);

  // Сохраняем позицию прокрутки перед переходом в карточку товара
  const handleProductClick = () => {
    if (typeof window !== 'undefined') {
      try {
        const scrollY = window.scrollY;
        if (pathname === '/catalog') {
          sessionStorage.setItem('catalogScrollPosition', scrollY.toString());
        } else if (pathname === '/') {
          sessionStorage.setItem('homeScrollPosition', scrollY.toString());
        }
      } catch (error) {
        // Игнорируем ошибки sessionStorage (например, QuotaExceededError или блокировка в инкогнито)
        // Не прерываем выполнение кода, чтобы не влиять на другие компоненты
        console.warn('Не удалось сохранить позицию прокрутки в sessionStorage:', error);
      }
    }
  };

  // URL изображения
  const imageUrl = product.images?.[0] || '';

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
      old_price: product.old_price ?? null,
      image: imageUrl || '/placeholder-product.jpg',
      slug: product.slug,
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
          old_price: product.old_price ?? null,
          image: product.images?.[0] || '/placeholder-product.jpg',
          slug: product.slug,
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
    <Card 
      className="group flex h-full flex-col overflow-hidden transition-all duration-200 hover:shadow-lg relative"
      data-product-id={product.id}
    >
      {/* Анимация привлечения внимания - СТАРЫЙ ВАРИАНТ: Большой центральный блок */}
      {showAttentionAnimation && (
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
          {/* Фон с эффектом свечения */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-red-500/20 to-purple-600/20 animate-attention-pulse"></div>
          
          {/* Центральный блок с анимацией */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-br from-orange-500 via-red-600 to-purple-700 rounded-xl px-6 py-4 shadow-2xl animate-attention-pulse border-2 border-white/50">
              <div className="text-center">
                <div className="text-5xl mb-3 flex items-center justify-center gap-2">
                  <span className="inline-block animate-fireworks" style={{ animationDelay: '0s' }}>🎆</span>
                  <span className="inline-block animate-fireworks" style={{ animationDelay: '0.2s' }}>🎇</span>
                  <span className="inline-block animate-fireworks" style={{ animationDelay: '0.4s' }}>✨</span>
                </div>
                <p className="text-white font-bold text-lg md:text-xl drop-shadow-lg whitespace-nowrap">
                  Посмотри меня!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* АЛЬТЕРНАТИВНЫЕ ВАРИАНТЫ (закомментированы):
      
      ВАРИАНТ 1: Деликатная рамка + бейдж
      {showAttentionAnimation && (
        <>
          <div className="absolute top-2 right-2 z-[60] pointer-events-none animate-attention-badge">
            <div className="bg-gradient-to-br from-orange-500 via-red-600 to-purple-700 rounded-lg px-3 py-2 shadow-xl border-2 border-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎆</span>
                <p className="text-white font-bold text-sm md:text-base drop-shadow-lg whitespace-nowrap">
                  Посмотри меня!
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      
      Для варианта 1 также нужно добавить класс на Card:
      className={`... ${showAttentionAnimation ? 'animate-attention-border' : ''}`}

      ВАРИАНТ 2: Волна по краям
      {showAttentionAnimation && (
        <>
          <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-lg">
            <div className="absolute top-0 left-0 right-0 h-[2px] animate-attention-wave-border" style={{...}}></div>
            <div className="absolute top-0 right-0 bottom-0 w-[2px] animate-attention-wave-border-vertical" style={{...}}></div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] animate-attention-wave-border" style={{...}}></div>
            <div className="absolute top-0 left-0 bottom-0 w-[2px] animate-attention-wave-border-vertical" style={{...}}></div>
            <div className="absolute top-2 right-2 z-[60] pointer-events-none animate-attention-badge">
              <div className="bg-gradient-to-br from-orange-500 to-purple-700 rounded-lg px-3 py-2 shadow-xl border-2 border-white/50">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🌊</span>
                  <p className="text-white font-bold text-sm drop-shadow-lg whitespace-nowrap">
                    Посмотри меня!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      ВАРИАНТ 3: Стрелка-указатель
      {showAttentionAnimation && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 z-[60] pointer-events-none animate-attention-arrow-slide">
          <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 shadow-2xl border-2 border-orange-500">
            <span className="text-2xl animate-attention-arrow-pulse">👆</span>
            <p className="text-gray-900 font-bold text-sm whitespace-nowrap">Посмотри меня!</p>
          </div>
        </div>
      )}

      ВАРИАНТ 4: Мягкое свечение (Glow)
      {showAttentionAnimation && (
        <>
          <div className="absolute inset-0 z-50 pointer-events-none rounded-lg animate-attention-glow"></div>
          <div className="absolute top-2 right-2 z-[60] pointer-events-none animate-attention-glow-badge">
            <div className="bg-gradient-to-br from-orange-500 via-red-600 to-purple-700 rounded-lg px-3 py-2 shadow-xl border-2 border-white/50">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✨</span>
                <p className="text-white font-bold text-sm drop-shadow-lg">Посмотри меня!</p>
              </div>
            </div>
          </div>
        </>
      )}
      */}
      <div className="relative">
        <Link href={`/product/${product.slug}`} onClick={handleProductClick}>
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {product.images && product.images.length > 0 ? (
              isFirst ? (
                // LCP изображение с максимальным приоритетом
                <img
                  src={imageUrl}
                  alt={`${product.name} - купить фейерверк в Москве и области с доставкой${product.category_name ? `, категория ${product.category_name}` : ''}`}
                  width={400}
                  height={400}
                  fetchPriority="high"
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : isAboveFold ? (
                // Above the fold - высокий приоритет
                <img
                  src={imageUrl}
                  alt={product.name}
                  width={400}
                  height={400}
                  loading="eager"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                // Below the fold - ленивая загрузка
                <img
                  src={imageUrl}
                  alt={`${product.name} - купить фейерверк в Москве и области с доставкой${product.category_name ? `, категория ${product.category_name}` : ''}`}
                  width={400}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              )
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
        {product.category_name && (
          <Badge className="absolute bottom-2 right-2 rounded bg-gray-700 px-2 py-1 font-semibold text-white shadow-md">
            {product.category_name}
          </Badge>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <Link href={`/product/${product.slug}`} onClick={handleProductClick}>
          <h3 className="group-hover:text-primary mb-2 min-h-[2.5rem] line-clamp-2 text-sm md:text-xl font-bold transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Характеристики */}
        {product.characteristics && (() => {
          const characteristics = getKeyCharacteristics(product.characteristics);
          return characteristics.length > 0 && (
            <div className="mb-3 min-h-[5rem]">
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {characteristics.map((char, index) => (
                  <div key={index} className="flex justify-between items-center text-[11px] md:text-base">
                    <span className="text-gray-600 font-normal truncate mr-2">{char.label}:</span>
                    <span className="text-gray-900 font-medium flex-shrink-0">{char.value}</span>
                  </div>
                ))}
              </div>
              {characteristics.length > 4 && (
                <div className="text-xs md:text-base text-gray-500 mt-1 text-center">
                  +{characteristics.length - 4} характеристик
                </div>
              )}
            </div>
          );
        })()}


        <div className="mt-auto">
          {product.old_price && product.old_price > product.price ? (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm line-through whitespace-nowrap">
                  {product.old_price.toLocaleString('ru-RU')} ₽
                </span>
                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
                  -{Math.round((1 - product.price / product.old_price) * 100)}%
                </span>
              </div>
              <p className="text-primary text-lg font-bold whitespace-nowrap">
                {product.price.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          ) : (
            <p className="text-primary text-lg font-bold text-right whitespace-nowrap">
              {product.price.toLocaleString('ru-RU')} ₽
            </p>
          )}
        </div>

        {/* Кнопка "См. видео" если есть видео */}
        {product.video_url && (
          <div className="mt-3">
            <Link href={`/product/${product.slug}?tab=video`}>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-primary border-primary hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-200 ease-out hover:shadow-md"
              >
                <Play className="mr-2 size-4" />
                См. видео
              </Button>
            </Link>
          </div>
        )}
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
