import { Metadata } from 'next';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { DeliveryHeroSection } from '@/components/sections/delivery-hero-section';
import { DeliveryOptionsSection } from '@/components/sections/delivery-options-section';
import { MapSection } from '@/components/sections/map-section';
import { AdditionalInfoSection } from '@/components/sections/additional-info-section';

export const metadata: Metadata = {
  title: 'Доставка фейерверков в Москве и МО | Самовывоз салютов',
  description:
    'Быстрая доставка фейерверков и салютов по Москве и Московской области. Самовывоз в Балашихе. Фиксированная стоимость доставки, профессиональная упаковка, гарантия качества.',
  keywords:
    'доставка фейерверков москва, купить салют с доставкой, самовывоз фейерверков балашиха, доставка пиротехники московская область',
  alternates: {
    canonical: 'https://salutgrad.ru/delivery',
  },
  openGraph: {
    title: 'Доставка фейерверков в Москве и МО',
    description: 'Быстрая доставка фейерверков и салютов по Москве и Московской области. Самовывоз в Балашихе. Фиксированная стоимость, профессиональная упаковка.',
    url: 'https://salutgrad.ru/delivery',
    siteName: 'СалютГрад',
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Доставка фейерверков в Москве и МО',
    description: 'Быстрая доставка фейерверков и салютов по Москве и Московской области. Самовывоз в Балашихе.',
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
        <DeliveryHeroSection />

        <DeliveryOptionsSection />

        <MapSection />

        <AdditionalInfoSection />
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
            "url": "https://salutgrad.ru/delivery",
            "telephone": "+7 (977) 360-20-08",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "деревня Чёрное",
              "addressRegion": "Московская область",
              "addressCountry": "RU",
              "streetAddress": "Рассветная улица, 14",
              "postalCode": "143921"
            },
            "additionalProperty": {
              "@type": "PropertyValue",
              "name": "Заезд",
              "value": "Со стороны ул. Лесные пруды"
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
