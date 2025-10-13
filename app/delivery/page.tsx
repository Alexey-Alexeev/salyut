import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import YandexMapWithFallback from '../../components/yandex-map';
import {
  Truck,
  Store,
  MapPin,
  Clock,
  Phone,
  Calculator,
  Info,
  CheckCircle,
} from 'lucide-react';
import { DELIVERY_CONSTANTS, formatDeliveryCost } from '@/lib/delivery-utils';

export const metadata: Metadata = {
  title: 'Доставка фейерверков в Москве и МО | Самовывоз салютов',
  description:
    'Быстрая доставка фейерверков и салютов по Москве и Московской области. Самовывоз в Балашихе. Фиксированная стоимость доставки, профессиональная упаковка, гарантия качества.',
  keywords:
    'доставка фейерверков москва, купить салют с доставкой, самовывоз фейерверков балашиха, доставка пиротехники московская область',
  openGraph: {
    title: 'Доставка фейерверков в Москве и МО',
    description: 'Быстрая доставка фейерверков и салютов по Москве и Московской области. Самовывоз в Балашихе. Фиксированная стоимость, профессиональная упаковка.',
    url: 'https://салютград.рф/delivery',
    siteName: 'СалютГрад',
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Доставка фейерверков в Москве и МО',
    description: 'Быстрая доставка фейерверков и салютов по Москве и Московской области. Самовывоз в Балашихе.',
  },
  alternates: {
    canonical: 'https://салютград.рф/delivery',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb items={[{ label: 'Доставка и самовывоз' }]} />
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Доставка фейерверков в Москве и МО</h1>
          <p className="text-muted-foreground text-xl">
            Быстрая доставка салютов и пиротехники по Москве и Московской области.
            Самовывоз в Балашихе. Фиксированная стоимость, профессиональная упаковка.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Доставка */}
          <Card className="relative overflow-hidden">
            <div className="absolute right-4 top-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Популярно
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Truck className="size-6 text-blue-600" aria-hidden="true" />
                </div>
                <span role="img" aria-label="доставка">🚚</span> Доставка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                  <CheckCircle className="size-5 shrink-0 text-green-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-green-900">
                      Москва, Балашиха, Люберцы
                    </p>
                    <p className="text-sm text-green-700">
                      Фиксированная стоимость:{' '}
                      <strong>
                        {formatDeliveryCost(
                          DELIVERY_CONSTANTS.MOSCOW_DELIVERY_COST
                        )}
                      </strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                  <Calculator className="size-5 shrink-0 text-blue-600" aria-hidden="true" />
                  <div>
                    <p className="font-medium text-blue-900">
                      Другие города Московской области
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>{DELIVERY_CONSTANTS.COST_PER_KM} ₽ за км</strong>{' '}
                      от МКАД
                    </p>
                    <p className="text-xs text-blue-600">
                      Минимальная стоимость:{' '}
                      {formatDeliveryCost(DELIVERY_CONSTANTS.MIN_DELIVERY_COST)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium">
                  <Info className="size-4" aria-hidden="true" />
                  Условия доставки:
                </h4>
                <ul className="text-muted-foreground ml-6 space-y-1 text-sm">
                  <li>• Доставка осуществляется в течение 1-3 дней</li>
                  <li>• Время доставки согласовывается с менеджером</li>
                  <li>• Оплата при получении (наличные или карта)</li>
                  <li>• Обязательна проверка документов (18+)</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Самовывоз */}
          <Card className="relative overflow-hidden">
            <div className="absolute right-4 top-4">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                Бесплатно
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-lg bg-green-100 p-2">
                  <Store className="size-6 text-green-600" aria-hidden="true" />
                </div>
                <span role="img" aria-label="самовывоз">🏬</span> Самовывоз
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 rounded-lg bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-green-900">
                      Адрес склада:
                    </h4>
                    <p className="text-sm leading-relaxed text-green-800">
                      {DELIVERY_CONSTANTS.PICKUP_ADDRESS.fullAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="size-5 shrink-0 text-green-600" aria-hidden="true" />
                  <div>
                    <h4 className="font-medium text-green-900">Телефон:</h4>
                    <p className="text-sm text-green-800">+7 (977) 360-20-08</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium">
                  <Info className="size-4" aria-hidden="true" />
                  Условия самовывоза:
                </h4>
                <ul className="text-muted-foreground ml-6 space-y-1 text-sm">
                  <li>• Предварительно позвоните для уточнения готовности</li>
                  <li>• Возьмите с собой документ, удостоверяющий личность</li>
                  <li>• Проверьте товар при получении</li>
                  <li>• Оплата наличными или картой на месте</li>
                  <li>• Парковка доступна возле склада</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Карта */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <MapPin className="size-6 text-slate-600" aria-hidden="true" />
              </div>
              Расположение склада
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Yandex Map */}
              <YandexMapWithFallback
                height="384px"
                className="w-full"
                showControls={true}
                zoom={15}
              />
            </div>
          </CardContent>
        </Card>

        {/* Дополнительная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Важная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">
                  <span role="img" aria-label="фейерверк">🎆</span> Безопасность
                </h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Продажа только лицам старше 18 лет</li>
                  <li>• Соблюдение правил перевозки пиротехники</li>
                  <li>• Сертифицированная продукция</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-medium">
                  <span role="img" aria-label="поддержка">📞</span> Поддержка
                </h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Консультации по выбору товаров</li>
                  <li>• Помощь с расчетом доставки</li>
                  <li>• Уведомления о готовности заказа</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="rounded-lg bg-gradient-to-r from-orange-50 to-red-50 p-6 text-center">
              <h3 className="mb-2 text-lg font-medium">
                <span role="img" aria-label="звезда">💫</span> Хотите особенное шоу?
              </h3>
              <p className="text-muted-foreground mb-4">
                Закажите профессиональный запуск салютов! Безопасно, эффектно,
                незабываемо.
              </p>
              <a
                href="/services/launching"
                className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
              >
                Узнать подробнее →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "Store"],
            "name": "СалютГрад",
            "description": "Доставка фейерверков и салютов по Москве и Московской области",
            "url": "https://салютград.рф/delivery",
            "telephone": "+7 (977) 360-20-08",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "деревня Чёрное",
              "addressRegion": "Московская область",
              "addressCountry": "RU",
              "streetAddress": "Рассветная улица, 14",
              "postalCode": "143921"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "55.740340",
              "longitude": "38.054064"
            },
            "openingHours": "Mo-Su 09:00-21:00",
            "areaServed": [
              {
                "@type": "City",
                "name": "Москва"
              },
              {
                "@type": "City",
                "name": "Балашиха"
              },
              {
                "@type": "City",
                "name": "Люберцы"
              }
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Услуги доставки",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Доставка фейерверков по Москве",
                    "description": "Фиксированная стоимость доставки фейерверков по Москве, Балашихе, Люберцам"
                  },
                  "price": "500",
                  "priceCurrency": "RUB",
                  "priceValidUntil": "2025-12-31",
                  "eligibleRegion": "RU-MOW",
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Доставка фейерверков по МО",
                    "description": "Доставка фейерверков по Московской области с расчетом по километражу"
                  },
                  "price": "100",
                  "priceCurrency": "RUB",
                  "priceValidUntil": "2025-12-31",
                  "eligibleRegion": "RU-MOS",
                  "priceSpecification": {
                    "@type": "UnitPriceSpecification",
                    "price": "100",
                    "priceCurrency": "RUB",
                    "unitText": "за километр от МКАД"
                  },
                  "availability": "https://schema.org/InStock"
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Самовывоз фейерверков",
                    "description": "Бесплатный самовывоз фейерверков со склада в Балашихе"
                  },
                  "price": "0",
                  "priceCurrency": "RUB",
                  "priceValidUntil": "2025-12-31",
                  "eligibleRegion": "RU-MOS",
                  "availability": "https://schema.org/InStock"
                }
              ]
            }
          })
        }}
      />
    </div>
  );
}
