'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Minus, Plus, Star, ChevronLeft, ChevronRight, FileText, Shield, AlertTriangle, ExternalLink, Sparkles, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCartStore } from '@/lib/cart-store';
import { ProductDescription } from '@/components/product-description';
import { toast } from 'sonner';

// Типы поддерживаемых видео платформ
type VideoPlatform = 'rutube' | 'vk' | 'youtube' | 'unknown';

// Интерфейс для информации о видео
interface VideoInfo {
  platform: VideoPlatform;
  videoId: string | null;
  embedUrl: string | null;
}

// Функция для получения правил безопасности по категории
function getSafetyRules(categoryName: string) {
  const safetyRules: Record<string, { title: string; rules: string[]; serviceText?: string }> = {
    'Салюты': {
      title: 'Правила безопасности для салютов',
      rules: [
        'Храните в сухом, прохладном месте, вдали от нагревательных приборов и источников огня.',
        'Не допускайте падений и повреждений упаковки.',
        'Перед запуском внимательно ознакомьтесь с инструкцией на упаковке.',
        'Запускайте фейерверк на открытом, безопасном пространстве, в безветренную погоду.',
        'Зрители должны находиться на расстоянии не менее 50-70 метров.'
      ],
      serviceText: 'Доверьте запуск опытным людям! Мы обеспечим полную безопасность, соблюдение всех норм и незабываемое шоу.'
    },
    'Веерные салюты': {
      title: 'Правила безопасности для веерных салютов',
      rules: [
        'Храните в сухом, прохладном месте, вдали от нагревательных приборов и источников огня.',
        'Не допускайте падений и повреждений упаковки.',
        'Перед запуском внимательно ознакомьтесь с инструкцией на упаковке.',
        'Запускайте фейерверк на открытом, безопасном пространстве, в безветренную погоду.',
        'Зрители должны находиться на расстоянии не менее 50-70 метров.'
      ],
      serviceText: 'Закажите услугу запуска! Мы обеспечим соблюдение всех норм, качественное исполнение и незабываемое шоу.'
    },
    'Бенгальские огни': {
      title: 'Правила безопасности для бенгальских огней',
      rules: [
        'Храните в сухом месте, вдали от источников огня и нагревательных приборов.',
        'Не допускайте повреждений упаковки и контакта с влагой.',
        'Перед использованием внимательно изучите инструкцию на упаковке.',
        'Используйте только на открытом воздухе, вдали от легковоспламеняющихся предметов.',
        'Держите на расстоянии вытянутой руки, не наклоняйтесь над горящим огнем.',
        'Дети должны использовать только под присмотром взрослых.',
        'После использования полностью погасите огонь в воде или песке.'
      ],
      serviceText: 'Для массовых мероприятий рекомендуем безопасный запуск салютов с соблюдением всех норм безопасности.'
    },
    'Римские свечи': {
      title: 'Правила безопасности для римских свечей',
      rules: [
        'Храните в сухом, прохладном месте, вдали от источников огня.',
        'Не допускайте падений и повреждений корпуса свечи.',
        'Перед запуском внимательно изучите инструкцию на упаковке.',
        'Запускайте только на открытом пространстве, в безветренную погоду.',
        'Зрители должны находиться на расстоянии не менее 30-50 метров.',
        'Держите свечу вертикально, не наклоняйте в сторону зрителей.',
        'После запуска не приближайтесь к свече в течение 15 минут.'
      ],
      serviceText: 'Для безопасного и эффектного запуска рекомендуем услуги профессиональных пиротехников.'
    },
    'Фонтаны': {
      title: 'Правила безопасности для фонтанов',
      rules: [
        'Храните в сухом месте, вдали от источников огня и нагревательных приборов.',
        'Не допускайте повреждений упаковки и контакта с влагой.',
        'Перед запуском внимательно изучите инструкцию на упаковке.',
        'Устанавливайте на ровную, негорючую поверхность (асфальт, бетон, песок).',
        'Зрители должны находиться на расстоянии не менее 20-30 метров.',
        'Не наклоняйтесь над фонтаном во время работы.',
      ],
      serviceText: 'Для массовых мероприятий и торжеств рекомендуем безопасный запуск пиротехники.'
    },
    'Петарды': {
      title: 'Правила безопасности для петард',
      rules: [
        'Храните в сухом месте, вдали от источников огня и нагревательных приборов.',
        'Не допускайте повреждений упаковки и контакта с влагой.',
        'Перед использованием внимательно изучите инструкцию на упаковке.',
        'Используйте только на открытом воздухе, вдали от людей и животных.',
        'Держите петарду на расстоянии вытянутой руки при поджигании.',
        'Не бросайте петарды в людей, животных или легковоспламеняющиеся предметы.',
        'Дети должны использовать петарды только под присмотром взрослых.'
      ],
      serviceText: 'Для безопасного и веселого праздника рекомендуем услуги профессиональных пиротехников.'
    },
    'Ракеты': {
      title: 'Правила безопасности для ракет',
      rules: [
        'Храните в сухом, прохладном месте, вдали от источников огня.',
        'Не допускайте падений и повреждений корпуса ракеты.',
        'Перед запуском внимательно изучите инструкцию на упаковке.',
        'Запускайте только на открытом пространстве, в безветренную погоду.',
        'Зрители должны находиться на расстоянии не менее 50-100 метров.',
        'Устанавливайте ракету вертикально в специальную пусковую трубу или в землю.',
        'Не запускайте вблизи линий электропередач, деревьев и зданий.'
      ],
      serviceText: 'Для безопасного и зрелищного запуска ракет рекомендуем услуги профессиональных пиротехников.'
    }
  };

  return safetyRules[categoryName] || null;
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

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  old_price?: number | null;
  images: string[] | null;
  video_url?: string | null;
  description: string | null;
  short_description?: string | null;
  characteristics: Record<string, any> | null;
  is_popular: boolean | null;
  is_active?: boolean | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
  manufacturer_id?: string | null;
  category_id?: string | null;
};

type RelatedProduct = Pick<
  Product,
  'id' | 'name' | 'slug' | 'price' | 'old_price' | 'images' | 'is_popular'
>;

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
  relatedProducts?: RelatedProduct[];
}

export default function ProductClient({
  product,
  category,
  manufacturer,
  relatedProducts = [],
}: ProductClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('description');
  const [catalogReturnUrl, setCatalogReturnUrl] = useState<string>('/catalog');
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabsRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore(state => state.addItem);

  // Отслеживаем монтирование компонента
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Восстанавливаем сохраненный URL каталога или главной страницы после монтирования
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const savedCatalogUrl = sessionStorage.getItem('catalogReturnUrl');
      const savedHomeUrl = sessionStorage.getItem('homeReturnUrl');
      
      if (savedCatalogUrl) {
        setCatalogReturnUrl(savedCatalogUrl);
      } else if (savedHomeUrl) {
        setCatalogReturnUrl(savedHomeUrl);
      }
    }
  }, [isMounted]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        old_price: product.old_price ?? null,
        image: product.images?.[0] || '',
        slug: product.slug,
      });
    }

    const quantityLabel = `${quantity} шт.`;
    toast.success(`${quantityLabel} добавлено в корзину`);
    setQuantity(1);
  };

  const images = product.images || [];
  const hasVideo = !!product.video_url;

  // Определяем, какую вкладку открыть по умолчанию
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'video' && hasVideo) {
      setActiveTab('video');
      // Плавная прокрутка к блоку вкладок только на мобильных устройствах
      const isMobile = window.innerWidth < 1024; // lg breakpoint
      if (isMobile) {
        setTimeout(() => {
          tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      setActiveTab('description');
    }
  }, [searchParams, hasVideo]);

  // Создаем массив медиа-контента: сначала изображения, потом видео
  const mediaItems = [
    ...images.map((image, index) => ({ type: 'image', src: image, index })),
    ...(hasVideo ? [{ type: 'video', src: product.video_url, index: images.length }] : [])
  ];

  const randomRelatedProducts = useMemo(() => {
    if (!relatedProducts.length) return [];

    const shuffled = [...relatedProducts];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 3);
  }, [relatedProducts]);

  // Функции для навигации по карусели
  const goToPrevious = () => {
    setSelectedImage(prev => prev > 0 ? prev - 1 : mediaItems.length - 1);
  };

  const goToNext = () => {
    setSelectedImage(prev => prev < mediaItems.length - 1 ? prev + 1 : 0);
  };

  // Навигация с клавиатуры
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (mediaItems.length <= 1) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mediaItems.length]);

  return (
    <div
      className="container mx-auto px-4 py-8"
      itemScope
      itemType="https://schema.org/Product"
    >
      <meta itemProp="name" content={product.name || 'Фейерверк'} />
      <meta
        itemProp="description"
        content={
          product.short_description ||
          product.description ||
          `Качественный ${product.name || 'фейерверк'} для праздников`
        }
      />
      <meta
        itemProp="brand"
        content={manufacturer?.name || 'СалютГрад'}
      />
      <meta
        itemProp="image"
        content={product.images?.[0] || 'https://salutgrad.ru/icons/icon_192.png'}
      />
      <meta itemProp="sku" content={product.id} />
      <meta itemProp="url" content={`https://salutgrad.ru/product/${product.slug}`} />
      <div itemProp="offers" itemScope itemType="https://schema.org/Offer">
        <meta itemProp="price" content={String(product.price)} />
        <meta itemProp="priceCurrency" content="RUB" />
        <meta
          itemProp="availability"
          content={
            product.is_active !== false
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock'
          }
        />
        <meta itemProp="url" content={`https://salutgrad.ru/product/${product.slug}`} />
      </div>
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(catalogReturnUrl)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Вернуться в каталог"
          >
            <ArrowLeft className="size-4" />
            <span className="text-sm font-medium">Назад в каталог</span>
          </button>
        </div>
        <div className="mt-2">
          <Breadcrumb
            items={[
              { href: catalogReturnUrl, label: 'Каталог' },
              ...(category ? [{ href: `/catalog?category=${category.slug}`, label: category.name }] : []),
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border group">
            {mediaItems[selectedImage]?.type === 'video' ? (() => {
              const videoInfo = getVideoInfo(mediaItems[selectedImage]?.src || '');
              return videoInfo.embedUrl ? (
                <iframe
                  src={videoInfo.embedUrl}
                  title={product.name}
                  className="h-full w-full"
                  allow="clipboard-write; autoplay"
                  allowFullScreen
                  frameBorder="0"
                  style={{ border: 'none' }}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8 text-center">
                  <div className="mb-4 text-6xl opacity-50">🎬</div>
                  <div className="text-lg font-medium text-gray-600 line-clamp-3">
                    {product.name}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Видео недоступно
                  </div>
                </div>
              );
            })() : mediaItems[selectedImage]?.type === 'image' ? (
              <Image
                src={mediaItems[selectedImage]?.src || ''}
                alt={`${product.name} - купить качественный фейерверк в Москве и области с доставкой${category ? `, категория ${category.name}` : ''}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8 text-center">
                <div className="mb-4 text-6xl opacity-50">📷</div>
                <div className="text-lg font-medium text-gray-600 line-clamp-3">
                  {product.name}
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Фото отсутствует
                </div>
              </div>
            )}

            {/* Стрелочки навигации */}
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                  aria-label="Предыдущее изображение"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                  aria-label="Следующее изображение"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Индикатор текущего элемента */}
            {mediaItems.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {selectedImage + 1} / {mediaItems.length}
              </div>
            )}
          </div>
          {mediaItems.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mediaItems.map((item, index) => (
                <button
                  key={index}
                  className={`relative size-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${selectedImage === index
                    ? 'border-primary'
                    : 'border-border hover:border-primary/50'
                    }`}
                  onClick={() => setSelectedImage(index)}
                >
                  {item.type === 'video' ? (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <div className="text-center">
                        <div className="mb-1 text-2xl">🎬</div>
                        <div className="text-xs font-medium">Видео</div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={item.src || ''}
                      alt={`${product.name} - фото ${index + 1}, купить фейерверк в Москве и области${category ? `, категория ${category.name}` : ''}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              {product.is_popular && (
                <Badge className="bg-orange-500">Популярный</Badge>
              )}
            </div>

            <div className="mb-6 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold lg:text-3xl">
                {product.name || 'Фейерверк'}
              </h1>
              <div className="flex flex-col items-end gap-1">
                {product.old_price && product.old_price > product.price ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-base lg:text-lg line-through whitespace-nowrap">
                        {product.old_price.toLocaleString('ru-RU')} ₽
                      </span>
                      <span className="bg-red-500 text-white text-sm font-semibold px-2 py-1 rounded">
                        -{Math.round((1 - product.price / product.old_price) * 100)}%
                      </span>
                    </div>
                    <div className="text-primary text-2xl lg:text-3xl font-bold whitespace-nowrap">
                      {product.price.toLocaleString('ru-RU')} ₽
                    </div>
                  </>
                ) : (
                  <div className="text-primary text-2xl lg:text-3xl font-bold whitespace-nowrap">
                    {product.price.toLocaleString('ru-RU')} ₽
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Количество:</span>
              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="min-w-[3rem] px-4 py-2 text-center">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <Button onClick={handleAddToCart} size="lg" className="w-full">
              <ShoppingCart className="mr-2 size-5" />
              Добавить {quantity} шт. в корзину •{' '}
              {(product.price * quantity).toLocaleString('ru-RU')} ₽
            </Button>
          </div>

          {/* Блок с вкладками */}
          <div ref={tabsRef}>
            <Card>
              <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid w-full h-9 sm:h-10 p-0.5 sm:p-1 ${hasVideo && getSafetyRules(category?.name || '') ? 'grid-cols-3' : hasVideo || getSafetyRules(category?.name || '') ? 'grid-cols-2' : 'grid-cols-1'}`}>
                  {hasVideo && (
                    <TabsTrigger 
                      value="video" 
                      className="flex items-center gap-1 sm:gap-1.5 relative group/video data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-md lg:data-[state=active]:border-blue-500/50 lg:border-2 lg:border-transparent lg:data-[state=active]:border-blue-500 transition-all hover:bg-blue-50/50 text-[11px] sm:text-sm px-1 sm:px-3 py-1 sm:py-1.5 overflow-hidden min-w-0"
                    >
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <Play className="size-3.5 sm:size-4 lg:size-6 text-blue-600 data-[state=active]:text-blue-700 lg:drop-shadow-sm fill-blue-100 lg:fill-blue-200" />
                        {/* Пульсирующий эффект для десктопа при hover */}
                        <span className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping opacity-0 lg:group-hover/video:opacity-100 hidden lg:block"></span>
                      </div>
                      <span className="font-semibold sm:font-semibold lg:font-bold lg:text-base relative">
                        Видео
                        {/* Маленький индикатор для десктопа */}
                        <span className="absolute -top-1 -right-2 hidden lg:block">
                          <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                            <span className="relative inline-flex size-2 rounded-full bg-blue-500"></span>
                          </span>
                        </span>
                      </span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="description" className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-sm px-1 sm:px-3 py-1 sm:py-1.5 overflow-hidden data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-md lg:data-[state=active]:border-purple-500/50 lg:border-2 lg:border-transparent lg:data-[state=active]:border-purple-500 transition-all hover:bg-purple-50/50">
                    <FileText className="size-3.5 sm:size-4 flex-shrink-0" />
                    <span>Описание</span>
                  </TabsTrigger>
                  {getSafetyRules(category?.name || '') && (
                    <TabsTrigger value="safety" className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-sm px-1 sm:px-3 py-1 sm:py-1.5 overflow-hidden min-w-0 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 data-[state=active]:shadow-md lg:data-[state=active]:border-orange-500/50 lg:border-2 lg:border-transparent lg:data-[state=active]:border-orange-500 transition-all hover:bg-orange-50/50">
                      <Shield className="size-3.5 sm:size-4 lg:size-5 flex-shrink-0" />
                      <span className="whitespace-nowrap">Безопасность</span>
                    </TabsTrigger>
                  )}
                </TabsList>

                {hasVideo && (
                  <TabsContent value="video" className="mt-6">
                    <div className="space-y-4">
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gray-100">
                        {(() => {
                          const videoInfo = getVideoInfo(product.video_url || '');
                          return videoInfo.embedUrl ? (
                            <iframe
                              src={videoInfo.embedUrl}
                              title={`Видео: ${product.name}`}
                              className="h-full w-full"
                              allow="clipboard-write; autoplay; encrypted-media; picture-in-picture"
                              allowFullScreen
                              frameBorder="0"
                              style={{ border: 'none' }}
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8 text-center">
                              <div className="mb-4 text-6xl opacity-50">🎬</div>
                              <div className="text-lg font-medium text-gray-600 line-clamp-3">
                                {product.name}
                              </div>
                              <div className="mt-2 text-sm text-gray-500">
                                Видео недоступно
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <p className="text-sm text-muted-foreground text-center lg:text-left">
                        Видео демонстрация товара <strong>{product.name}</strong>
                      </p>
                    </div>
                  </TabsContent>
                )}

                <TabsContent value="description" className="mt-6">
                  <ProductDescription
                    description={product.description}
                    shortDescription={product.short_description}
                  />

                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 mt-6">
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link 
                            href={`/catalog?category=${category.slug}`}
                            className="font-medium text-primary underline hover:opacity-80 transition-opacity"
                          >
                            {category.name}
                          </Link>
                          <span className="text-muted-foreground">•</span>
                          <Link 
                            href={catalogReturnUrl}
                            className="font-medium text-primary underline hover:opacity-80 transition-opacity"
                          >
                            В каталог
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {getSafetyRules(category?.name || '') && (
                  <TabsContent value="safety" className="mt-6">
                    {(() => {
                      const safetyData = getSafetyRules(category?.name || '');
                      if (!safetyData) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="size-5 text-orange-600" />
                            <h3 className="text-lg font-semibold text-orange-600">Важно! {safetyData.title}:</h3>
                          </div>

                          <div className="space-y-3 text-sm">
                            {safetyData.rules.map((rule, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p>{rule}</p>
                              </div>
                            ))}
                          </div>

                          {/* Ссылка на услугу профессионального запуска */}
                          {safetyData.serviceText && (
                            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 mt-6">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                    <Sparkles className="size-5 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-orange-800 font-semibold mb-2 flex items-center gap-2">
                                    🎆 {safetyData.serviceText}
                                  </h4>
                                  <p className="text-orange-700 text-sm mb-3">
                                    <strong>Не рискуйте — оставьте всё нам!</strong>
                                  </p>
                                  <Link
                                    href="/services/launching"
                                    className="text-orange-600 underline hover:text-orange-700 mt-2 inline-block"
                                  >
                                    Подробнее об услуге →
                                  </Link>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </TabsContent>
                )}
              </Tabs>
            </CardContent>
          </Card>
          </div>

          {/* Блок характеристик */}
          {product.characteristics && Object.keys(product.characteristics).length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-4 text-lg font-semibold">Характеристики</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {Object.entries(product.characteristics).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="border-border/50 flex justify-between border-b py-2"
                      >
                        <span className="font-medium">{key}:</span>
                        <span className="text-muted-foreground">
                          {String(value)}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {randomRelatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-2xl font-bold">Вам также может понравиться</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {randomRelatedProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className="group rounded-lg border bg-white p-3 transition-shadow hover:shadow-md"
              >
                <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-gray-100">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                      Фото отсутствует
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="line-clamp-2 text-sm font-medium text-gray-900">
                    {item.name}
                  </div>
                  <div className="flex items-center gap-2">
                    {item.old_price && item.old_price > item.price && (
                      <span className="text-xs text-gray-400 line-through">
                        {item.old_price.toLocaleString('ru-RU')} ₽
                      </span>
                    )}
                    <span className="text-base font-bold text-primary">
                      {item.price.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
