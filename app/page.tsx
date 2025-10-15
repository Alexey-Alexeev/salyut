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

export const metadata: Metadata = {
  title: 'Фейерверки и салюты в Москве и МО | Качественная пиротехника',
  description: 'Купить фейерверки в Москве и МО с доставкой. Профессиональный запуск салюта на свадьбу и день рождения. Лучшие салюты и пиротехника от проверенных производителей!',
  keywords: 'купить фейерверки в москве с доставкой, профессиональный запуск салюта на свадьбу, салюты на день рождения, пиротехника москва, петарды, ракеты, фонтаны, новый год, качественные фейерверки',
  openGraph: {
    title: 'Фейерверки и салюты в Москве и МО',
    description: 'Купить фейерверки в Москве с доставкой. Профессиональный запуск салюта на свадьбу и день рождения. Лучшие салюты и пиротехника!',
    url: 'https://салютград.рф',
    siteName: 'СалютГрад',
    images: [
      {
        url: 'https://салютград.рф/images/hero-bg.webp',
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
    description: 'Купить фейерверки в Москве и МО с доставкой. Профессиональный запуск салюта на свадьбу и день рождения.',
    images: ['https://салютград.рф/images/hero-bg.webp'],
  },
  alternates: {
    canonical: 'https://салютград.рф',
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
      <HeroSection />

      <DeliverySection />

      <DiscountSection />

      <CategoriesSection categories={categoriesData} />

      <PopularProductsSection products={popularProducts} />

      <ProfessionalServicesSection />

      <VideoReviewsSection videoReviews={videoReviews} />

      {/* CTA Section с диалогом */}
      <ConsultationCTA className="pb-8 md:pb-16" />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "Store"],
            "name": "СалютГрад",
            "description": "Лучшие фейерверки, салюты и пиротехника в Москве и МО. Быстрая доставка, профессиональный запуск, гарантия качества.",
            "url": "https://салютград.рф",
            "telephone": "+7 (977) 360-20-08",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Рассветная улица, 14",
              "addressLocality": "деревня Чёрное",
              "addressRegion": "Московская область",
              "addressCountry": "RU",
              "postalCode": "143921"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "55.740340",
              "longitude": "38.054064"
            },
            "openingHours": "Mo-Su 09:00-21:00",
            "priceRange": "₽₽",
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
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Product",
                  "name": category.name,
                  "description": `Фейерверки и пиротехника категории ${category.name}`
                },
                "position": index + 1
              }))
            },
            "hasProduct": popularProducts.slice(0, 3).map(product => ({
              "@type": "Product",
              "name": product.name,
              "description": product.description || `Качественный ${product.name} для праздников`,
              "image": product.images?.[0] || "https://салютград.рф/images/product-placeholder.jpg",
              "brand": {
                "@type": "Brand",
                "name": "СалютГрад"
              },
              "category": "Пиротехника",
              "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "RUB",
                "availability": product.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                  "@type": "Organization",
                  "name": "СалютГрад"
                },
                "url": `https://салютград.рф/product/${product.slug}`
              }
            })),
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": "127",
              "bestRating": "5",
              "worstRating": "1"
            },
            "review": [
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Анна Петрова"
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody": "Заказывали салют на свадьбу - получилось невероятно красиво! Профессиональный запуск, все гости были в восторге."
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Михаил Соколов"
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody": "Отличное качество фейерверков, доставка быстрая. Сын был в восторге от салюта на день рождения!"
              },
              {
                "@type": "Review",
                "author": {
                  "@type": "Person",
                  "name": "Елена Козлова"
                },
                "reviewRating": {
                  "@type": "Rating",
                  "ratingValue": "5",
                  "bestRating": "5"
                },
                "reviewBody": "Профессиональный подход, безопасность на высоте. Рекомендую для любых праздников!"
              }
            ],
            "video": videoReviews.slice(0, 4).map(video => ({
              "@type": "VideoObject",
              "name": video.title || "Видеоотзыв о фейерверках",
              "description": "Реальные отзывы клиентов о наших фейерверках",
              "thumbnailUrl": video.thumbnail_url || "https://салютград.рф/images/video-thumb.jpg",
              "duration": "PT30S",
              "uploadDate": video.created_at || new Date().toISOString(),
              "contentUrl": video.video_url || "https://салютград.рф/videos/review.mp4",
              "embedUrl": video.embed_url || `https://салютград.рф/embed/${video.id}`
            }))
          })
        }}
      />
    </div>
  );
}
