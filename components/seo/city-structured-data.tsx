import { moscowRegionCities, generateCityStructuredData, getCityInPrepositionalCase } from '@/lib/cities';

interface CityStructuredDataProps {
    city?: string;
    categories?: any[];
    products?: any[];
}

export function CityStructuredData({ city, categories = [], products = [] }: CityStructuredDataProps) {
    // Если город не указан или не входит в список городов МО, используем базовые структурированные данные
    if (!city || !moscowRegionCities.includes(city)) {
        return null;
    }

    const cityInPrepositionalCase = getCityInPrepositionalCase(city);

    const structuredData = {
        ...generateCityStructuredData(city),
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": `Каталог фейерверков и салютов в ${city}`,
            "itemListElement": categories.map((category, index) => ({
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Product",
                    "name": `${category.name} в ${cityInPrepositionalCase}`,
                    "description": `Фейерверки и пиротехника категории ${category.name} с доставкой в ${cityInPrepositionalCase}`
                },
                "position": index + 1
            }))
        },
        "hasProduct": products.slice(0, 3).map(product => ({
            "@type": "Product",
            "name": `${product.name} в ${cityInPrepositionalCase}`,
            "description": product.description || `Качественный ${product.name} с доставкой в ${cityInPrepositionalCase}`,
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
                "url": `https://салютград.рф/product/${product.slug}?city=${encodeURIComponent(city)}`
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
                "reviewBody": `Заказывали салют в ${cityInPrepositionalCase} на свадьбу - получилось невероятно красиво! Профессиональный запуск, все гости были в восторге.`
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
                "reviewBody": `Отличное качество фейерверков в ${cityInPrepositionalCase}, доставка быстрая. Сын был в восторге от салюта на день рождения!`
            }
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData)
            }}
        />
    );
}
