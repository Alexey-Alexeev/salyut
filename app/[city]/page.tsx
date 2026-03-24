import { ConsultationCTA } from '@/components/consultation-cta';
import { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { HeroSection } from '@/components/sections/hero-section';
import { DeliverySection } from '@/components/sections/delivery-section';
import { DiscountSection } from '@/components/sections/discount-section';
import { CategoriesSection } from '@/components/sections/categories-section';
import { EventCollectionsSection } from '@/components/sections/event-collections-section';
import { PopularProductsSection } from '@/components/sections/popular-products-section';
import { ProfessionalServicesSection } from '@/components/sections/professional-services-section';
import { VideoReviewsSection } from '@/components/sections/video-reviews-section';
import { cities, getCityBySlug, getAllCitySlugs } from '@/lib/cities';
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
import {
    DELIVERY_CONSTANTS,
    formatDeliveryCost,
    isFixedDeliveryCity,
} from '@/lib/delivery-utils';

const DELIVERY_PAGE_PATH = '/delivery';
const DELIVERY_PAGE_ABSOLUTE_URL = 'https://salutgrad.ru/delivery/';
const CATALOG_PAGE_PATH = '/catalog';
const CATALOG_PAGE_ABSOLUTE_URL = 'https://salutgrad.ru/catalog/';

const faqInlineLinkClass =
    'font-medium text-orange-700 underline underline-offset-2 hover:text-orange-900';

const cityIntroPatterns = [
    'Подберём пиротехнику под формат праздника, бюджет и площадку запуска: от компактных батарей салютов до масштабных программ.',
    'Поможем собрать оптимальный комплект: от небольших семейных фейерверков до эффектных залпов для крупного события.',
    'Сориентируем по мощности, времени работы и формату шоу, чтобы пиротехника точно подошла под ваш сценарий праздника.',
];

const cityOrderPatterns = [
    'После подтверждения согласуем удобный интервал и уточним детали по адресу.',
    'Менеджер уточнит все детали заказа и подскажет лучший вариант по срокам и формату получения.',
    'При необходимости скорректируем состав заказа и время доставки под ваш праздник.',
];

const cityLaunchPatterns = [
    'Перед запуском поможем оценить площадку и безопасные расстояния до зрителей.',
    'Учитываем формат мероприятия и заранее согласуем технические детали запуска.',
    'Работаем по требованиям безопасности и подбираем сценарий запуска под ваш бюджет.',
];

const citySubtitlePatterns = [
    'Коротко о доставке, подборе пиротехники и запуске — в формате быстрых ответов.',
    'Собрали основные вопросы по заказу, доставке и запуску в одном месте.',
    'Самое важное про оформление заказа и запуск салюта в вашем городе.',
];

type CityFaqProfile = {
    introAddon: string;
    orderAddon: string;
    launchAddon: string;
    subtitleAddon: string;
};

const CITY_FAQ_PROFILES: Record<string, CityFaqProfile> = {
    moskva: {
        introAddon: 'Ориентируемся на разные форматы площадок: от частных территорий до мероприятий в городской черте.',
        orderAddon: 'Для заказов по Москве и области можем быстро согласовать удобный формат получения.',
        launchAddon: 'Для крупных мероприятий заранее обсуждаем логистику и схему безопасных зон.',
        subtitleAddon: 'Отдельно собрали ответы для Москвы и Московской области.',
    },
    balashiha: {
        introAddon: 'Часто помогаем подобрать решения для семейных праздников и частных мероприятий в округе.',
        orderAddon: 'Для Балашихи и близлежащих районов обычно доступны удобные окна доставки.',
        launchAddon: 'Подскажем, как безопасно организовать запуск в городской среде и на частной площадке.',
        subtitleAddon: 'С учётом частых заказов по Балашихе и соседним районам.',
    },
    lyubertsy: {
        introAddon: 'Подбираем позиции под формат дворовых праздников и частных мероприятий.',
        orderAddon: 'По Люберцам помогаем выбрать удобный интервал и формат доставки.',
        launchAddon: 'Даём рекомендации по безопасному запуску с учётом плотной застройки.',
        subtitleAddon: 'С акцентом на частые запросы клиентов из Люберец.',
    },
    reutov: {
        introAddon: 'Поможем выбрать компактные и эффектные решения для городского формата праздника.',
        orderAddon: 'Для Реутова подскажем оптимальный вариант по времени и получению заказа.',
        launchAddon: 'Для запуска учитываем требования безопасности в условиях городской застройки.',
        subtitleAddon: 'Подготовили ответы для заказов по Реутову.',
    },
    'orekhovo-zuevo': {
        introAddon: 'Часто подбираем как бюджетные варианты, так и более масштабные программы для мероприятий.',
        orderAddon: 'По Орехово-Зуево подскажем оптимальный способ получения и подтверждения заказа.',
        launchAddon: 'Помогаем заранее спланировать безопасный запуск под формат вашей площадки.',
        subtitleAddon: 'С учётом регулярных заказов в Орехово-Зуево.',
    },
    'pavlovsky-posad': {
        introAddon: 'Подбираем пиротехнику под семейные праздники, юбилеи и городские события.',
        orderAddon: 'Для Павловского Посада уточняем детали заказа и подбираем удобный сценарий доставки.',
        launchAddon: 'Подскажем безопасный формат запуска для частных и открытых площадок.',
        subtitleAddon: 'Собрали полезные ответы именно для Павловского Посада.',
    },
    elektrostal: {
        introAddon: 'Помогаем собрать программу запуска под разные бюджеты и формат мероприятия.',
        orderAddon: 'По Электростали согласуем детали заказа и формат получения заранее.',
        launchAddon: 'Подсказываем безопасные сценарии запуска для частных и открытых территорий.',
        subtitleAddon: 'Отдельный набор ответов для клиентов из Электростали.',
    },
};

const faqQuestionVariants = {
    intro: [
        'Купить салюты и фейерверки',
        'Где заказать салюты и фейерверки',
        'Как выбрать салюты и фейерверки',
    ],
    order: [
        'Как оформить заказ на салюты',
        'Как заказать фейерверки',
        'Как быстро оформить покупку салюта',
    ],
    delivery: [
        'Есть ли доставка салютов',
        'Как работает доставка фейерверков',
        'Какие условия доставки салютов',
    ],
    launch: [
        'Можно ли заказать безопасный запуск салюта',
        'Как заказать профессиональный запуск фейерверка',
        'Организуете ли вы безопасный запуск салюта',
    ],
};

function getCityVariantIndex(slug: string, variantsCount: number): number {
    let hash = 0;
    for (let i = 0; i < slug.length; i += 1) {
        hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
    }
    return hash % variantsCount;
}

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

    const title = `Купить салют и фейерверк в ${cityData.nameLocative} - заказать доставку и запуск`;
    const description = cityData.metaDescription;

    return {
        title,
        description,
        keywords: `купить фейерверки в ${cityData.nameLocative}, салюты в ${cityData.nameLocative}, пиротехника в ${cityData.nameLocative}, заказать салют в ${cityData.nameLocative}, доставка фейерверков ${cityData.name}, безопасный запуск салюта ${cityData.name}`,
        openGraph: {
            title: `Купить салют и фейерверк в ${cityData.nameLocative} - заказать доставку и запуск`,
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
            title: `Купить салют и фейерверк в ${cityData.nameLocative} - заказать доставку и запуск`,
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
    const isMoscowPage = cityData.slug === 'moskva';
    const relatedCities = cities.filter((city) => city.slug !== cityData.slug).slice(0, 8);
    const fixedDeliveryZone = isFixedDeliveryCity(cityData.name);
    const fixedDeliveryPriceLabel = formatDeliveryCost(
        DELIVERY_CONSTANTS.MOSCOW_DELIVERY_COST
    );
    const variantIndex = getCityVariantIndex(cityData.slug, cityIntroPatterns.length);
    const questionVariantIndex = getCityVariantIndex(cityData.slug, faqQuestionVariants.intro.length);
    const cityProfile = CITY_FAQ_PROFILES[cityData.slug];
    const introPattern = cityIntroPatterns[variantIndex];
    const orderPattern = cityOrderPatterns[variantIndex];
    const launchPattern = cityLaunchPatterns[variantIndex];
    const subtitlePattern = citySubtitlePatterns[variantIndex];
    const introLine = cityProfile ? `${introPattern} ${cityProfile.introAddon}` : introPattern;
    const orderLine = cityProfile ? `${orderPattern} ${cityProfile.orderAddon}` : orderPattern;
    const launchLine = cityProfile ? `${launchPattern} ${cityProfile.launchAddon}` : launchPattern;
    const subtitleLine = cityProfile ? `${subtitlePattern} ${cityProfile.subtitleAddon}` : subtitlePattern;

    const faqIntroPlain = isMoscowPage
        ? `Если вы ищете, где купить салют в мск, интернет-магазин СалютГрад поможет с выбором и доставкой по Москве и области. Вы также можете купить салюты и фейерверки в ${cityData.nameLocative} с консультацией менеджера. ${introLine} Доступны услуги по запуску фейерверка — при необходимости возьмём на себя организацию запуска салюта профессионально и с соблюдением требований безопасности, чтобы праздник прошёл ярко и безопасно.`
        : `В интернет-магазине СалютГрад вы можете купить салюты и фейерверки в ${cityData.nameLocative} с удобной доставкой и консультацией менеджера. ${introLine} Доступны услуги по запуску фейерверка — при необходимости возьмём на себя организацию запуска салюта профессионально и с соблюдением требований безопасности, чтобы праздник прошёл ярко и безопасно.`;

    const deliveryFaqPlain = fixedDeliveryZone
        ? `Да, доставляем салюты и фейерверки по ${cityData.nameLocative} и соседним населённым пунктам. Фиксированная стоимость доставки по адресу в ${cityData.nameLocative} — ${fixedDeliveryPriceLabel}. Подробнее о доставке: ${DELIVERY_PAGE_ABSOLUTE_URL}`
        : `Да, доставляем салюты и фейерверки по ${cityData.nameLocative} и соседним населённым пунктам. Стоимость доставки по Московской области зависит от адреса (базовая сумма плюс километраж от МКАД). Подробные условия и расчёт — на странице ${DELIVERY_PAGE_ABSOLUTE_URL}`;

    const deliveryFaqAnswer: ReactNode = fixedDeliveryZone
        ? (
              <>
                  Да, доставляем салюты и фейерверки по {cityData.nameLocative} и соседним
                  населённым пунктам. Фиксированная стоимость доставки по адресу в{' '}
                  {cityData.nameLocative} — {fixedDeliveryPriceLabel}. Подробнее о доставке{' '}
                  <Link
                      href={DELIVERY_PAGE_PATH}
                      className="font-medium text-orange-700 underline hover:text-orange-900"
                  >
                      здесь
                  </Link>
                  .
              </>
          )
        : (
              <>
                  Да, доставляем салюты и фейерверки по {cityData.nameLocative} и соседним населённым пунктам.
                  {' '}
                  Стоимость доставки по Московской области зависит от адреса (базовая сумма плюс километраж от МКАД).
                  {' '}
                  Подробные условия и расчёт — на{' '}
                  <Link
                      href={DELIVERY_PAGE_PATH}
                      className="font-medium text-orange-700 underline hover:text-orange-900"
                  >
                      странице доставки
                  </Link>
                  .
              </>
          );

    const faqItems: {
        question: string;
        answer: ReactNode;
        answerPlain: string;
    }[] = [
        {
            question: `${faqQuestionVariants.intro[questionVariantIndex]} в ${cityData.nameLocative}: доставка и услуги по запуску фейерверка`,
            answer: faqIntroPlain,
            answerPlain: faqIntroPlain,
        },
        {
            question: `${faqQuestionVariants.order[questionVariantIndex]} в ${cityData.nameLocative}?`,
            answer: (
                <>
                    Выберите товары в{' '}
                    <Link
                        href="/catalog"
                        className="font-medium text-orange-700 underline hover:text-orange-900"
                    >
                        каталоге
                    </Link>
                    , оформите заказ на сайте или свяжитесь с менеджером. Мы подтвердим заказ и
                    организуем доставку по {cityData.nameLocative} и ближайшим районам. {orderLine}
                </>
            ),
            answerPlain: `Выберите товары в каталоге, оформите заказ на сайте или свяжитесь с менеджером. Мы подтвердим заказ и организуем доставку по ${cityData.nameLocative} и ближайшим районам. ${orderLine}`,
        },
        {
            question: `${faqQuestionVariants.delivery[questionVariantIndex]} по ${cityData.nameLocative}?`,
            answer: deliveryFaqAnswer,
            answerPlain: deliveryFaqPlain,
        },
        {
            question: `${faqQuestionVariants.launch[questionVariantIndex]} в ${cityData.nameLocative}?`,
            answer: (
                <>
                    Да, доступна услуга профессионального запуска. Специалист поможет подобрать
                    площадку и проведёт запуск с учётом требований безопасности. {launchLine} Подробнее об
                    услуге{' '}
                    <Link
                        href="/services/launching"
                        className="font-medium text-orange-700 underline hover:text-orange-900"
                    >
                        здесь
                    </Link>
                    .
                </>
            ),
            answerPlain: `Да, доступна услуга профессионального запуска. Специалист поможет подобрать площадку и проведёт запуск с учётом требований безопасности. ${launchLine} Подробнее об услуге: https://salutgrad.ru/services/launching/`,
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

            {/* CTA Section с диалогом */}
            <ConsultationCTA className="pb-8 md:pb-16" />

            <section className="bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="mb-10 space-y-4 text-center">
                        <h2 className="text-3xl font-bold md:text-4xl">Вопросы о заказе в {cityData.nameLocative}</h2>
                        <p className="text-muted-foreground mx-auto max-w-2xl text-base">
                            {isMoscowPage ? (
                                <>
                                    Доставка, выбор пиротехники, услуги по запуску фейерверка и организация запуска салюта — кратко в одном блоке.
                                    {' '}
                                    Удобно, если нужно купить салют в мск и по Московской области.
                                </>
                            ) : (
                                <>
                                    {subtitleLine}
                                </>
                            )}
                        </p>
                    </div>
                    <div className="mx-auto max-w-3xl rounded-lg border border-gray-200 bg-white px-4 py-2 md:px-6">
                        <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
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
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 pb-12">
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                    <h2 className="mb-3 text-xl font-semibold text-gray-900">Смотрите также</h2>
                    <div className="flex flex-wrap gap-2">
                        <Link
                            href={CATALOG_PAGE_PATH}
                            className={faqInlineLinkClass}
                        >
                            Каталог фейерверков
                        </Link>
                        <span className="text-gray-400">•</span>
                        <Link
                            href={DELIVERY_PAGE_PATH}
                            className={faqInlineLinkClass}
                        >
                            Доставка и самовывоз
                        </Link>
                        <span className="text-gray-400">•</span>
                        <Link
                            href="/services/launching"
                            className={faqInlineLinkClass}
                        >
                            Организация запуска
                        </Link>
                    </div>
                    <div className="mt-4">
                        <p className="mb-2 text-sm text-gray-600">Другие города Московской области:</p>
                        <div className="flex flex-wrap gap-2">
                            {relatedCities.map((city) => (
                                <Link
                                    key={city.slug}
                                    href={`/${city.slug}/`}
                                    className="rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-orange-500 hover:text-orange-600"
                                >
                                    {city.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

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
                                        "value": "700",
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
                                "text": item.answerPlain
                            }
                        }))
                    })
                }}
            />
        </div>
    );
}


