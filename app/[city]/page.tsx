import { db } from '@/lib/db';
import { categories, products, reviews } from '@/db/schema';
import { desc, eq, and } from 'drizzle-orm';
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
import { getCityBySlug, getAllCitySlugs } from '@/lib/cities';
import { notFound } from 'next/navigation';
import { BUSINESS_INFO, CATEGORY_PRICES, PRICE_VALID_UNTIL, filterVisibleCategories } from '@/lib/schema-constants';

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

    const title = `Фейерверки и салюты в ${cityData.nameLocative} - заказать с доставкой и запуском`;
    const description = cityData.metaDescription;

    return {
        title,
        description,
        keywords: `купить фейерверки в ${cityData.nameLocative}, салюты в ${cityData.nameLocative}, пиротехника в ${cityData.nameLocative}, заказать салют в ${cityData.nameLocative}, доставка фейерверков ${cityData.name}, безопасный запуск салюта ${cityData.name}`,
        openGraph: {
            title: `Фейерверки и салюты в ${cityData.nameLocative} - профессиональный запуск`,
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
            title: `Фейерверки и салюты в ${cityData.nameLocative} - безопасный запуск`,
            description,
            images: ['https://salutgrad.ru/images/hero-bg.webp'],
        },
        alternates: {
            canonical: `https://salutgrad.ru/${params.city}/`,
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
    let eventCounts = {
        wedding: 0,
        birthday: 0,
        new_year: 0,
    };

    try {
        [categoriesData, popularProducts] = await Promise.all([
            db.select().from(categories),
            db
                .select()
                .from(products)
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
            {/* Hero Section с названием города */}
            <HeroSection cityName={cityData.nameLocative} />

            <DeliverySection />

            <DiscountSection />

            <CategoriesSection categories={categoriesData} />

            <PopularProductsSection products={popularProducts} />

            <EventCollectionsSection eventCounts={eventCounts} />

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
                                "@type": "Category",
                                "name": category.name,
                                "description": `Категория фейерверков и пиротехники: ${category.name} в ${cityData.nameLocative}`,
                                "url": `https://salutgrad.ru/catalog?category=${category.slug}`,
                                "image": category.image,
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
                            "category": product.category_id ? categoriesData.find(cat => cat.id === product.category_id)?.name || "Пиротехника" : "Пиротехника",
                            "sku": product.id,
                            "url": `https://salutgrad.ru/product/${product.slug}`,
                            "offers": {
                                "@type": "Offer",
                                "price": product.price,
                                "priceCurrency": "RUB",
                                "priceValidUntil": PRICE_VALID_UNTIL,
                                "availability": product.is_active ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                                "seller": {
                                    "@type": "Organization",
                                    "name": "СалютГрад",
                                    "url": "https://salutgrad.ru",
                                    "telephone": "+7 (977) 360-20-08"
                                },
                                "url": `https://salutgrad.ru/product/${product.slug}`,
                                "areaServed": {
                                    "@type": "City",
                                    "name": cityData.name
                                },
                                "shippingDetails": {
                                    "@type": "OfferShippingDetails",
                                    "shippingRate": {
                                        "@type": "MonetaryAmount",
                                        "value": "500",
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
                                            "minValue": 1,
                                            "maxValue": 3,
                                            "unitCode": "DAY"
                                        },
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
                            "name": video.title || `Видеоотзыв о фейерверках в ${cityData.nameLocative}`,
                            "description": `Реальные отзывы клиентов о наших фейерверках в ${cityData.nameLocative}`,
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


