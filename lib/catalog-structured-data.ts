import { Product, Category, Pagination } from '@/types/catalog';
import { PRICE_VALID_UNTIL } from '@/lib/schema-constants';

/**
 * Генерирует JSON-LD структурированные данные для каталога товаров
 * @param products - Список товаров для отображения
 * @param categories - Список категорий
 * @param pagination - Информация о пагинации
 * @returns JSON-LD объект для каталога
 */
export function generateCatalogStructuredData(
    products: Product[],
    categories: Category[],
    pagination: Pagination
) {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Каталог фейерверков и салютов",
        "description": "Каталог качественных фейерверков и салютов в Москве и МО. Большой выбор пиротехники от проверенных производителей.",
        "url": "https://salutgrad.ru/catalog",
        "mainEntity": {
            "@type": "ItemList",
            "name": "Каталог фейерверков и салютов",
            "description": "Список всех доступных фейерверков и салютов",
            "numberOfItems": pagination.totalCount,
            "itemListElement": products.slice(0, 20).map((product, index) => ({
                "@type": "Product",
                "position": index + 1,
                "name": product.name,
                "description": product.short_description || `Качественный ${product.name} для праздников`,
                "image": product.images?.[0] || "https://salutgrad.ru/images/product-placeholder.jpg",
                "brand": {
                    "@type": "Brand",
                    "name": "СалютГрад"
                },
                "category": product.category_id ? categories.find(cat => cat.id === product.category_id)?.name || "Пиротехника" : "Пиротехника",
                "sku": product.id,
                "url": `https://salutgrad.ru/product/${product.slug}`,
                "offers": {
                    "@type": "Offer",
                    "price": product.price,
                    "priceCurrency": "RUB",
                    "priceValidUntil": PRICE_VALID_UNTIL,
                    "availability": "https://schema.org/InStock",
                    "seller": {
                        "@type": "Organization",
                        "name": "СалютГрад",
                        "url": "https://salutgrad.ru"
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
            }))
        },
        "breadcrumb": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Главная",
                    "item": "https://salutgrad.ru"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Каталог товаров",
                    "item": "https://salutgrad.ru/catalog"
                }
            ]
        }
    };
}

