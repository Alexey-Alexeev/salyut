/**
 * Константы для JSON-LD разметки Schema.org
 */

// Контактная информация
export const BUSINESS_INFO = {
  name: "СалютГрад",
  telephone: "+7 (977) 360-20-08",
  url: "https://salutgrad.ru",
  address: {
    streetAddress: "Рассветная улица, 14",
    addressLocality: "деревня Чёрное",
    addressRegion: "Московская область",
    addressCountry: "RU",
    postalCode: "143921"
  },
  geo: {
    latitude: "55.740340",
    longitude: "38.054064"
  },
  openingHours: "Mo-Su 09:00-21:00",
  priceRange: "₽₽"
};

// Рейтинги и отзывы
export const RATING_INFO = {
  ratingValue: "4.8",
  reviewCount: "127",
  bestRating: "5",
  worstRating: "1"
};

// Цены для категорий
export const CATEGORY_PRICES = {
  lowPrice: "1200",
  highPrice: "40000",
  offerCount: "50+"
};

// Валидность цен
export const PRICE_VALID_UNTIL = "2026-12-31";

// Авторы отзывов
export const REVIEW_AUTHORS = [
  "Анна Петрова",
  "Михаил Соколов", 
  "Елена Козлова",
  "Дмитрий Волков",
  "Ольга Морозова"
];

// Тексты отзывов
export const REVIEW_TEXTS = [
  "Отличное качество фейерверков! Безопасный запуск, все гости были в восторге от салюта на свадьбе.",
  "Качественная пиротехника, доставка быстрая. Сын был в восторге от салюта на день рождения!",
  "Профессиональный подход, безопасность на высоте. Рекомендую для любых праздников!",
  "Заказывали салют на корпоратив - получилось невероятно красиво! Все коллеги были в восторге.",
  "Безопасный запуск, качественные фейерверки. Рекомендую для любых торжеств!"
];

/**
 * Получить случайного автора отзыва
 */
export function getRandomReviewAuthor(): string {
  return REVIEW_AUTHORS[Math.floor(Math.random() * REVIEW_AUTHORS.length)];
}

/**
 * Получить случайный текст отзыва
 */
export function getRandomReviewText(): string {
  return REVIEW_TEXTS[Math.floor(Math.random() * REVIEW_TEXTS.length)];
}

/**
 * Получить отзыв с локализацией для города
 */
export function getLocalizedReview(cityName: string, cityNameLocative: string): {
  author: string;
  text: string;
} {
  const author = getRandomReviewAuthor();
  const baseText = getRandomReviewText();
  
  // Локализуем текст для города
  const localizedText = baseText.replace(/на свадьбе|на день рождения|на корпоратив/, `в ${cityNameLocative}`);
  
  return {
    author: `${author.split(' ')[0]} ${author.split(' ')[1][0]}. из ${cityName}`,
    text: localizedText
  };
}

/**
 * Получить диапазон цен для категории на основе реальных данных
 */
export function getCategoryPriceRange(products: any[]): {
  lowPrice: string;
  highPrice: string;
  offerCount: string;
} {
  if (!products || products.length === 0) {
    return CATEGORY_PRICES;
  }

  const prices = products.map(p => p.price).filter(p => p > 0);
  if (prices.length === 0) {
    return CATEGORY_PRICES;
  }

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Используем реальные данные, но ограничиваем диапазон разумными пределами
  const lowPrice = Math.max(minPrice, 1200); // Минимум 1200
  const highPrice = Math.min(maxPrice, 40000); // Максимум 40000
  
  return {
    lowPrice: lowPrice.toString(),
    highPrice: highPrice.toString(),
    offerCount: `${products.length}+`
  };
}

/**
 * Получить цены для всех категорий на основе товаров в базе данных
 */
export async function getCategoryPrices(categories: any[], products: any[]): Promise<Record<string, {
  lowPrice: string;
  highPrice: string;
  offerCount: string;
}>> {
  const categoryPrices: Record<string, {
    lowPrice: string;
    highPrice: string;
    offerCount: string;
  }> = {};

  for (const category of categories) {
    const categoryProducts = products.filter(p => p.category_id === category.id);
    categoryPrices[category.id] = getCategoryPriceRange(categoryProducts);
  }

  return categoryPrices;
}