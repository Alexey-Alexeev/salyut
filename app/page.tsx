import { db } from '@/lib/db';
import { categories, products, reviews } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { eq, and } from 'drizzle-orm';
import { ConsultationCTA } from '@/components/consultation-cta';
import { Metadata } from 'next';
import { HeroSection } from '@/components/sections/hero-section';
import { DeliverySection } from '@/components/sections/delivery-section';
import { DiscountSection } from '@/components/sections/discount-section';
import { CategoriesSection } from '@/components/sections/categories-section';
import { PopularProductsSection } from '@/components/sections/popular-products-section';
import { ProfessionalServicesSection } from '@/components/sections/professional-services-section';
import { VideoReviewsSection } from '@/components/sections/video-reviews-section';
import dynamicImport from 'next/dynamic';
import { BUSINESS_INFO, RATING_INFO, CATEGORY_PRICES, PRICE_VALID_UNTIL, getRandomReviewAuthor, getRandomReviewText } from '@/lib/schema-constants';

// Динамические импорты для тяжелых компонентов
const DynamicVideoReviewsSection = dynamicImport(() => import('@/components/sections/video-reviews-section').then(mod => ({ default: mod.VideoReviewsSection })), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />,
  ssr: true
});

export const metadata: Metadata = {
  title: 'Фейерверки и салюты в Москве и МО | Качественная пиротехника',
  description: 'Купить фейерверки в Москве и МО с доставкой. Безопасный запуск салюта на свадьбу и другие праздники! Лучшие салюты и пиротехника от проверенных производителей!',
  keywords: 'купить фейерверки в москве с доставкой, безопасный запуск салюта на свадьбу, салюты на день рождения, пиротехника москва, петарды, ракеты, фонтаны, новый год, качественные фейерверки',
  openGraph: {
    title: 'Фейерверки и салюты в Москве и МО',
    description: 'Купить фейерверки в Москве с доставкой. Безопасный запуск салюта на свадьбу и другие праздники! Лучшие салюты и пиротехника!',
    url: 'https://salutgrad.ru',
    siteName: 'СалютГрад',
    images: [
      {
        url: 'https://salutgrad.ru/images/hero-bg.webp',
        width: 1200,
        height: 630,
        alt: 'Фейерверки и салюты - СалютГрад',
      },
    ],
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Фейерверки и салюты в Москве и МО',
    description: 'Купить фейерверки в Москве и МО с доставкой. Безопасный запуск салюта на свадьбу и другие праздники!',
    images: ['https://salutgrad.ru/images/hero-bg.webp'],
  },
  alternates: {
    canonical: 'https://salutgrad.ru',
  },
  other: {
    'contact:email': 'info@salutgrad.ru',
    'contact:phone_number': '+7 (977) 360-20-08',
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

export default async function HomePage() {
  let categoriesData: any[] = [];
  let popularProducts: any[] = [];
  let videoReviews: any[] = [];

  try {
    [categoriesData, popularProducts] = await Promise.all([
      db.select().from(categories),
      db
        .select()
        .from(products)
        .where(and(eq(products.is_popular, true), eq(products.is_active, true)))
        .limit(4),
    ]);
  } catch (error) {
    console.error('Error loading categories or products:', error);
  }

  try {
    videoReviews = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.created_at))
      .limit(4);
  } catch (error) {
    console.error('Error loading reviews:', error);
  }

  return (
    <div className="space-y-8">
      {/* Preload критических изображений */}
      
      <HeroSection />

      <DeliverySection />

      <DiscountSection />

      <CategoriesSection categories={categoriesData} />

      <PopularProductsSection products={popularProducts} />

      <ProfessionalServicesSection />

      <DynamicVideoReviewsSection videoReviews={videoReviews} />

      {/* CTA Section с диалогом */}
      <ConsultationCTA className="pb-8 md:pb-16" />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "Store"],
            "name": BUSINESS_INFO.name,
            "description": "Лучшие фейерверки, салюты и пиротехника в Москве и МО. Быстрая доставка, безопасный запуск, гарантия качества.",
            "url": BUSINESS_INFO.url,
            "telephone": BUSINESS_INFO.telephone,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": BUSINESS_INFO.address.streetAddress,
              "addressLocality": BUSINESS_INFO.address.addressLocality,
              "addressRegion": BUSINESS_INFO.address.addressRegion,
              "addressCountry": BUSINESS_INFO.address.addressCountry,
              "postalCode": BUSINESS_INFO.address.postalCode
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": BUSINESS_INFO.geo.latitude,
              "longitude": BUSINESS_INFO.geo.longitude
            },
            "openingHours": BUSINESS_INFO.openingHours,
            "priceRange": BUSINESS_INFO.priceRange,
            "servedArea": {
              "@type": "GeoCircle",
              "geoMidpoint": {
                "@type": "GeoCoordinates",
                "latitude": "55.740340",
                "longitude": "38.054064"
              },
              "geoRadius": "50000"
            },
            "areaServed": ["Москва", "Московская область"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Каталог фейерверков и салютов",
              "itemListElement": categoriesData.map((category, index) => ({
                "@type": "Category",
                "name": category.name,
                "description": `Категория фейерверков и пиротехники: ${category.name}`,
                "url": `https://salutgrad.ru/catalog?category=${category.slug}`,
                "image": category.image,
                "position": index + 1
              }))
            },
            "hasProduct": popularProducts.slice(0, 3).map(product => ({
              "@type": "Product",
              "name": product.name,
              "description": product.description || `Качественный ${product.name} для праздников`,
              "image": product.images?.[0] || "https://salutgrad.ru/images/product-placeholder.jpg",
              "brand": {
                "@type": "Brand",
                "name": "СалютГрад"
              },
              "category": product.category_id ? categoriesData.find(cat => cat.id === product.category_id)?.name || "Пиротехника" : "Пиротехника",
              "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "RUB",
                "priceValidUntil": PRICE_VALID_UNTIL,
                "availability": product.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                  "@type": "Organization",
                  "name": "СалютГрад"
                },
                "url": `https://salutgrad.ru/product/${product.slug}`
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": RATING_INFO.ratingValue,
                "reviewCount": RATING_INFO.reviewCount,
                "bestRating": RATING_INFO.bestRating,
                "worstRating": RATING_INFO.worstRating
              },
              "review": [
                {
                  "@type": "Review",
                  "author": {
                    "@type": "Person",
                    "name": getRandomReviewAuthor()
                  },
                  "reviewRating": {
                    "@type": "Rating",
                    "ratingValue": "5",
                    "bestRating": "5"
                  },
                  "reviewBody": getRandomReviewText()
                }
              ]
            })),
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": RATING_INFO.ratingValue,
              "reviewCount": RATING_INFO.reviewCount,
              "bestRating": RATING_INFO.bestRating,
              "worstRating": RATING_INFO.worstRating
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": getRandomReviewAuthor()
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody": getRandomReviewText()
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": getRandomReviewAuthor()
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody": getRandomReviewText()
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": getRandomReviewAuthor()
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody": getRandomReviewText()
              }
            ],
            "video": videoReviews.slice(0, 4).map(video => ({
              "@type": "VideoObject",
              "name": video.title || "Видеоотзыв о фейерверках",
              "description": "Реальные отзывы клиентов о наших фейерверках",
              "thumbnailUrl": video.thumbnail_url || "https://salutgrad.ru/images/video-thumb.jpg",
              "duration": "PT30S",
              "uploadDate": video.created_at || new Date().toISOString(),
              "contentUrl": video.video_url || "https://salutgrad.ru/videos/review.mp4",
              "embedUrl": video.embed_url || `https://salutgrad.ru/embed/${video.id}`
            }))
          })
        }}
      />
    </div>
  );
}
