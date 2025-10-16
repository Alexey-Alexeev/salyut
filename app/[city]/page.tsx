import { db } from '@/lib/db';
import { categories, products, reviews } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
import { ConsultationCTA } from '@/components/consultation-cta';
import { Metadata } from 'next';
import { HeroSection } from '@/components/sections/hero-section';
import { DeliverySection } from '@/components/sections/delivery-section';
import { DiscountSection } from '@/components/sections/discount-section';
import { CategoriesSection } from '@/components/sections/categories-section';
import { PopularProductsSection } from '@/components/sections/popular-products-section';
import { ProfessionalServicesSection } from '@/components/sections/professional-services-section';
import { VideoReviewsSection } from '@/components/sections/video-reviews-section';
import { getCityBySlug, getAllCitySlugs } from '@/lib/cities';
import { notFound } from 'next/navigation';

interface CityPageProps {
    params: {
        city: string;
    };
}

// Генерация статических страниц для всех городов
export async function generateStaticParams() {
    return getAllCitySlugs().map((slug) => ({
        city: slug,
    }));
}

// Генерация метаданных для каждой городской страницы
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
    const cityData = getCityBySlug(params.city);

    if (!cityData) {
        return {
            title: 'Страница не найдена',
        };
    }

    const title = `Купить фейерверки и салюты в ${cityData.nameLocative} | СалютГрад`;
    const description = cityData.metaDescription;

    return {
        title,
        description,
        keywords: `купить фейерверки в ${cityData.nameLocative}, салюты в ${cityData.nameLocative}, пиротехника в ${cityData.nameLocative}, заказать салют в ${cityData.nameLocative}, доставка фейерверков ${cityData.name}, безопасный запуск салюта ${cityData.name}`,
        openGraph: {
            title,
            description,
            url: `https://salutgrad.ru/${params.city}`,
            siteName: 'СалютГрад',
            images: [
                {
                    url: 'https://salutgrad.ru/images/hero-bg.webp',
                    width: 1200,
                    height: 630,
                    alt: `Фейерверки и салюты в ${cityData.nameLocative} - СалютГрад`,
                },
            ],
            locale: 'ru_RU',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['https://salutgrad.ru/images/hero-bg.webp'],
        },
        alternates: {
            canonical: `https://salutgrad.ru/${params.city}`,
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
}

export default async function CityPage({ params }: CityPageProps) {
    const cityData = getCityBySlug(params.city);

    // Если город не найден, показываем 404
    if (!cityData) {
        notFound();
    }

    // Загружаем данные для страницы
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
            {/* Hero Section с названием города */}
            <HeroSection cityName={cityData.nameLocative} />

            <DeliverySection />

            <DiscountSection />

            <CategoriesSection categories={categoriesData} />

            <PopularProductsSection products={popularProducts} />

            <ProfessionalServicesSection />

            <VideoReviewsSection videoReviews={videoReviews} />

            {/* CTA Section с диалогом */}
            <ConsultationCTA className="pb-8 md:pb-16" />

            {/* JSON-LD Structured Data для локальной страницы */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": ["LocalBusiness", "Store"],
                        "name": `СалютГрад - ${cityData.name}`,
                        "description": `Лучшие фейерверки, салюты и пиротехника в ${cityData.nameLocative}. Быстрая доставка, безопасный запуск, гарантия качества.`,
                        "url": `https://salutgrad.ru/${params.city}`,
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
                        "areaServed": {
                            "@type": "City",
                            "name": cityData.name,
                            "containedIn": {
                                "@type": "AdministrativeArea",
                                "name": cityData.region
                            }
                        },
                        "hasOfferCatalog": {
                            "@type": "OfferCatalog",
                            "name": `Каталог фейерверков и салютов в ${cityData.nameLocative}`,
                            "itemListElement": categoriesData.map((category, index) => ({
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Product",
                                    "name": category.name,
                                    "description": `Фейерверки и пиротехника категории ${category.name} в ${cityData.nameLocative}`
                                },
                                "position": index + 1
                            }))
                        },
                        "hasProduct": popularProducts.slice(0, 3).map(product => ({
                            "@type": "Product",
                            "name": product.name,
                            "description": product.description || `Качественный ${product.name} для праздников в ${cityData.nameLocative}`,
                            "image": product.images?.[0] || "https://salutgrad.ru/images/product-placeholder.jpg",
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
                                "url": `https://salutgrad.ru/product/${product.slug}`,
                                "areaServed": {
                                    "@type": "City",
                                    "name": cityData.name
                                }
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
                                    "name": `Анна П. из ${cityData.name}`
                                },
                                "reviewRating": {
                                    "@type": "Rating",
                                    "ratingValue": "5",
                                    "bestRating": "5"
                                },
                                "reviewBody": `Заказывали салют на свадьбу в ${cityData.nameLocative} - получилось невероятно красиво! Безопасный запуск, все гости были в восторге.`
                            },
                            {
                                "@type": "Review",
                                "author": {
                                    "@type": "Person",
                                    "name": `Михаил С. из ${cityData.name}`
                                },
                                "reviewRating": {
                                    "@type": "Rating",
                                    "ratingValue": "5",
                                    "bestRating": "5"
                                },
                                "reviewBody": `Отличное качество фейерверков, доставка в ${cityData.nameAccusative} быстрая. Сын был в восторге от салюта на день рождения!`
                            }
                        ],
                        "video": videoReviews.slice(0, 4).map(video => ({
                            "@type": "VideoObject",
                            "name": video.title || `Видеоотзыв о фейерверках в ${cityData.nameLocative}`,
                            "description": `Реальные отзывы клиентов о наших фейерверках в ${cityData.nameLocative}`,
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


