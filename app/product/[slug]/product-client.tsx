'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Minus, Plus, Star, ChevronLeft, ChevronRight, FileText, Shield, AlertTriangle, ExternalLink, Sparkles } from 'lucide-react';
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
      serviceText: 'Доверьте запуск профессионалам! Мы обеспечим полную безопасность, соблюдение всех норм и незабываемое шоу.'
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
      serviceText: 'Доверьте запуск профессионалам! Мы обеспечим полную безопасность, соблюдение всех норм и незабываемое шоу.'
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
      serviceText: 'Для массовых мероприятий рекомендуем профессиональный запуск салютов с соблюдением всех норм безопасности.'
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
      serviceText: 'Для массовых мероприятий и торжеств рекомендуем профессиональный запуск пиротехники.'
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
  images: string[] | null;
  video_url?: string | null;
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
  const hasVideo = !!product.video_url;

  // Создаем массив медиа-контента: сначала изображения, потом видео
  const mediaItems = [
    ...images.map((image, index) => ({ type: 'image', src: image, index })),
    ...(hasVideo ? [{ type: 'video', src: product.video_url, index: images.length }] : [])
  ];

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb
          items={[
            { href: '/catalog', label: 'Каталог' },
            { label: product.name },
          ]}
        />
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
                alt={product.name}
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
                      alt={`${product.name} ${index + 1}`}
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
                {product.name}
              </h1>
              <div className="text-primary text-3xl font-bold">
                {product.price.toLocaleString('ru-RU')} ₽
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
              Добавить в корзину •{' '}
              {(product.price * quantity).toLocaleString('ru-RU')} ₽
            </Button>
          </div>

          {/* Блок с вкладками */}
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="description" className="flex items-center gap-2">
                    <FileText className="size-4" />
                    Описание
                  </TabsTrigger>
                  {getSafetyRules(category?.name || '') && (
                    <TabsTrigger value="safety" className="flex items-center gap-2">
                      <Shield className="size-4" />
                      Безопасность
                    </TabsTrigger>
                  )}
                </TabsList>

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
                        <span className="font-medium">{category.name}</span>
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
                                    <strong>Не рискуйте безопасностью — оставьте всё профессионалам!</strong>
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
    </div>
  );
}
