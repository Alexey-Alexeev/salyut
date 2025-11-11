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
import { EventCollectionsSection } from '@/components/sections/event-collections-section';
import { PopularProductsSection } from '@/components/sections/popular-products-section';
import { ProfessionalServicesSection } from '@/components/sections/professional-services-section';
import { VideoReviewsSection } from '@/components/sections/video-reviews-section';
import { HomeScrollRestore } from '@/components/home-scroll-restore';
import dynamic from 'next/dynamic';
import { BUSINESS_INFO, CATEGORY_PRICES, PRICE_VALID_UNTIL, filterVisibleCategories } from '@/lib/schema-constants';

// Динамические импорты для тяжелых компонентов
const DynamicVideoReviewsSection = dynamic(() => import('@/components/sections/video-reviews-section').then(mod => ({ default: mod.VideoReviewsSection })), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />,
  ssr: true
});

export const metadata: Metadata = {
  title: 'Фейерверки и салюты в Москве и МО | СалютГрад',
  description: 'Купить фейерверки в Москве и МО с доставкой. Безопасный запуск салюта на свадьбу и другие праздники! Лучшие салюты и пиротехника от проверенных производителей!',
  keywords: 'купить фейерверки в москве с доставкой, безопасный запуск салюта на свадьбу, салюты на день рождения, пиротехника москва, петарды, ракеты, фонтаны, новый год, качественные фейерверки',
  openGraph: {
    title: 'Фейерверки и салюты в Москве и МО | СалютГрад',
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
    title: 'Фейерверки и салюты в Москве и МО | СалютГрад',
    description: 'Купить фейерверки в Москве и МО с доставкой. Безопасный запуск салюта на свадьбу и другие праздники!',
    images: ['https://salutgrad.ru/images/hero-bg.webp'],
  },
  alternates: {
    canonical: 'https://salutgrad.ru/',
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
  let eventCounts = {
    wedding: 0,
    birthday: 0,
    new_year: 0,
  };

  try {
    [categoriesData, popularProducts] = await Promise.all([
      db.select().from(categories),
      db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          old_price: products.old_price,
          category_id: products.category_id,
          category_name: categories.name,
          category_slug: categories.slug,
          images: products.images,
          video_url: products.video_url,
          is_popular: products.is_popular,
          short_description: products.short_description,
          characteristics: products.characteristics,
          created_at: products.created_at,
        })
        .from(products)
        .leftJoin(categories, eq(products.category_id, categories.id))
        .where(and(eq(products.is_popular, true), eq(products.is_active, true)))
        .limit(4),
    ]);
    // Фильтруем скрытые категории
    categoriesData = filterVisibleCategories(categoriesData);
  } catch (error) {
    console.error('Error loading categories or products:', error);
  }

  // Подсчитываем количество салютов для каждого события
  try {
    const allProducts = await db
      .select({
        event_types: products.event_types,
      })
      .from(products)
      .where(eq(products.is_active, true));

    allProducts.forEach((product) => {
      const eventTypes = product.event_types as string[] | null;
      if (eventTypes && Array.isArray(eventTypes)) {
        if (eventTypes.includes('wedding')) eventCounts.wedding++;
        if (eventTypes.includes('birthday')) eventCounts.birthday++;
        if (eventTypes.includes('new_year')) eventCounts.new_year++;
      }
    });
  } catch (error) {
    console.error('Error loading event counts:', error);
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
      {/* <HomeScrollRestore /> */}
      {/* Preload критических изображений */}
      
      <HeroSection />

      <DeliverySection />

      <DiscountSection />

      <CategoriesSection categories={categoriesData} />

      <EventCollectionsSection eventCounts={eventCounts} />

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
                "url": `https://salutgrad.ru/product/${product.slug}`,
                "shippingDetails": {
                  "@type": "OfferShippingDetails",
                  "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "500",
                    "currency": "RUB"
                  },
                  "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "businessDays": {
                      "@type": "OpeningHoursSpecification",
                      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                    },
                    "cutoffTime": "23:59"
                  },
                  "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "RU",
                    "addressRegion": "Московская область",
                    "addressLocality": "Москва"
                  }
                },
                "pickupDetails": {
                  "@type": "OfferShippingDetails",
                  "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "0",
                    "currency": "RUB"
                  },
                  "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                      "@type": "QuantitativeValue",
                      "minValue": 0,
                      "maxValue": 1,
                      "unitCode": "DAY"
                    },
                    "transitTime": {
                      "@type": "QuantitativeValue",
                      "minValue": 0,
                      "maxValue": 0,
                      "unitCode": "DAY"
                    },
                    "businessDays": {
                      "@type": "OpeningHoursSpecification",
                      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                      "opens": "09:00",
                      "closes": "21:00"
                    }
                  },
                  "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "RU",
                    "addressRegion": "Московская область",
                    "addressLocality": "Балашиха",
                    "streetAddress": "Рассветная улица, 14",
                    "postalCode": "143921"
                  }
                },
                "hasMerchantReturnPolicy": {
                  "@type": "MerchantReturnPolicy",
                  "applicableCountry": "RU",
                  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                  "merchantReturnDays": 7,
                  "returnMethod": "https://schema.org/ReturnByMail",
                  "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility"
                }
              },
            })),
            "video": videoReviews.slice(0, 4).map(video => ({
              "@type": "VideoObject",
              "name": video.title || "Видеоотзыв о фейерверках",
              "description": "Реальные отзывы клиентов о наших фейерверках",
              "thumbnailUrl": video.thumbnail_url,
              "duration": "PT30S",
              "uploadDate": video.created_at || new Date().toISOString(),
              "contentUrl": video.video_url
            }))
          })
        }}
      />
    </div>
  );
}
