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
import { BUSINESS_INFO, CATEGORY_PRICES, PRICE_VALID_UNTIL } from '@/lib/schema-constants';
import { QuizSection } from '@/components/quiz-section';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
    getEventCounts,
    getPopularProducts,
    getVideoReviews,
    getVisibleCategories,
} from '@/lib/page-data';

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

    const title = `Купить салюты и фейерверки в ${cityData.nameLocative} - заказать доставку и запуск`;
    const description = cityData.metaDescription;

    return {
        title,
        description,
        keywords: `купить фейерверки в ${cityData.nameLocative}, салюты в ${cityData.nameLocative}, пиротехника в ${cityData.nameLocative}, заказать салют в ${cityData.nameLocative}, доставка фейерверков ${cityData.name}, безопасный запуск салюта ${cityData.name}`,
        openGraph: {
            title: `Купить салюты и фейерверки в ${cityData.nameLocative} - заказать доставку и запуск`,
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
            title: `Купить салюты и фейерверки в ${cityData.nameLocative} - заказать доставку и запуск`,
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

    const [categoriesData, popularProductsRaw, videoReviewsRaw, eventCounts] = await Promise.all([
        getVisibleCategories(),
        getPopularProducts(),
        getVideoReviews(),
        getEventCounts(),
    ]);
    const popularProducts: any[] = popularProductsRaw as any[];
    const videoReviews: any[] = videoReviewsRaw as any[];
    const faqItems = [
        {
            question: `Как купить салюты и фейерверки в ${cityData.nameLocative}?`,
            answer: `Выберите товары в каталоге, оформите заказ на сайте или свяжитесь с менеджером. Мы подтвердим заказ и организуем доставку по ${cityData.name}.`,
        },
        {
            question: `Есть ли доставка салютов по ${cityData.name}?`,
            answer: `Да, мы доставляем салюты и фейерверки по ${cityData.name} и ближайшим районам. Точную стоимость и время доставки подскажет менеджер при оформлении.`,
        },
        {
            question: `Можно ли заказать безопасный запуск салюта в ${cityData.nameLocative}?`,
            answer: `Да, у нас доступна услуга профессионального запуска. Специалист поможет подобрать площадку и проведет запуск с учетом требований безопасности.`,
        },
    ];

    return (
        <div className="space-y-8">
            {/* Hero Section с названием города */}
            <HeroSection cityName={cityData.nameLocative} />

            <DeliverySection />

            <DiscountSection />

            <QuizSection />

            <CategoriesSection categories={categoriesData} />

            <PopularProductsSection products={popularProducts} />

            <EventCollectionsSection eventCounts={eventCounts} />

            <ProfessionalServicesSection />

            <VideoReviewsSection videoReviews={videoReviews} />

            <section className="container mx-auto rounded-2xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/40 px-5 py-8 shadow-sm md:px-8">
                <p className="mb-3 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700">
                    Доставка и запуск в {cityData.name}
                </p>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
                    Купить салюты и фейерверки в {cityData.nameLocative}
                </h2>
                <div className="space-y-3 text-base leading-relaxed text-gray-700">
                    <p>
                        В интернет-магазине СалютГрад вы можете купить салюты и фейерверки в {cityData.nameLocative}{' '}
                        с удобной доставкой и консультацией менеджера.
                    </p>
                    <p>
                        Подберем пиротехнику под ваш формат праздника, бюджет и площадку запуска: от компактных
                        батарей салютов до масштабных эффектных программ.
                    </p>
                    <p>
                        При необходимости организуем профессиональный запуск, чтобы ваш праздник прошел ярко и
                        безопасно.
                    </p>
                </div>
            </section>

            <section className="container mx-auto rounded-2xl border bg-white px-5 py-8 shadow-sm md:px-8">
                <h2 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                    Часто задаваемые вопросы
                </h2>
                <p className="mb-4 text-sm text-gray-600">
                    Быстрые ответы по доставке, выбору и безопасному запуску салютов в {cityData.nameLocative}.
                </p>
                <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item, index) => (
                        <AccordionItem
                            key={item.question}
                            value={`faq-${index}`}
                            className="border-b border-gray-200 last:border-none"
                        >
                            <AccordionTrigger className="py-4 text-left text-base font-semibold text-gray-900 hover:no-underline">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 text-base leading-relaxed text-gray-700">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>

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
                                        "streetAddress": "улица Агрогородок, вл31",
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
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": faqItems.map((item) => ({
                            "@type": "Question",
                            "name": item.question,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": item.answer
                            }
                        }))
                    })
                }}
            />
        </div>
    );
}


