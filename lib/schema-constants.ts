/**
 * Константы для JSON-LD разметки Schema.org
 */

// Контактная информация
export const BUSINESS_INFO = {
  name: "СалютГрад",
  telephone: "+7 (977) 360-20-08",
  url: "https://salutgrad.ru",
  address: {
    streetAddress: "улица Агрогородок, вл31",
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

// Ссылки на официальные страницы организации
export const ORGANIZATION_LINKS = {
  website: "https://salutgrad.ru",
  catalog: "https://salutgrad.ru/catalog",
  delivery: "https://salutgrad.ru/delivery",
  yandexProfile: "https://yandex.ru/profile/94416577675?lang=ru"
};

// Массив ссылок для поля sameAs в JSON-LD
export const SAME_AS_LINKS = [
  ORGANIZATION_LINKS.website,
  ORGANIZATION_LINKS.catalog,
  ORGANIZATION_LINKS.delivery,
  ORGANIZATION_LINKS.yandexProfile
];

// Рейтинги и отзывы - убраны для избежания рисков с SEO
// export const RATING_INFO = {
//   ratingValue: "4.8",
//   reviewCount: "127",
//   bestRating: "5",
//   worstRating: "1"
// };

// Цены для категорий
export const CATEGORY_PRICES = {
  lowPrice: "1200",
  highPrice: "40000",
  offerCount: "50+"
};

// Валидность цен
export const PRICE_VALID_UNTIL = "2026-12-31";

// Список slug'ов категорий, которые нужно скрыть (категории без товаров в БД)
// Используем lowercase для сравнения, поэтому регистр не важен
export const HIDDEN_CATEGORY_SLUGS = [
  'rockets',       // Ракеты
  'fountains',     // Фонтаны
  'sparklers',     // Бенгальские огни (старый slug)
  'bengal-lights', // Бенгальские огни (новый slug - будет работать с Bengal-lights, bengal-lights, etc)
].map(slug => slug.toLowerCase());

/**
 * Фильтровать категории, исключая скрытые
 * Нормализует slug (убирает пробелы, приводит к lowercase) для надежного сравнения
 */
export function filterVisibleCategories<T extends { slug: string }>(categories: T[]): T[] {
  if (!categories || categories.length === 0) {
    return [];
  }
  
  const filtered = categories.filter(category => {
    if (!category || !category.slug) {
      return true; // Сохраняем категории без slug (на всякий случай)
    }
    // Нормализуем slug: убираем пробелы, приводим к lowercase, заменяем множественные дефисы
    const categorySlug = category.slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Заменяем пробелы на дефисы
      .replace(/-+/g, '-')  // Заменяем множественные дефисы на один
      .replace(/^-|-$/g, ''); // Убираем дефисы в начале и конце
    
    const isHidden = HIDDEN_CATEGORY_SLUGS.includes(categorySlug);
    
    return !isHidden;
  });
  
  return filtered;
}

// Авторы отзывов - убраны для избежания рисков с SEO
// export const REVIEW_AUTHORS = [
//   "Анна Петрова",
//   "Михаил Соколов", 
//   "Елена Козлова",
//   "Дмитрий Волков",
//   "Ольга Морозова"
// ];

// Тексты отзывов - убраны для избежания рисков с SEO
// export const REVIEW_TEXTS = [
//   "Отличное качество фейерверков! Безопасный запуск, все гости были в восторге от салюта на свадьбе.",
//   "Качественная пиротехника, доставка быстрая. Сын был в восторге от салюта на день рождения!",
//   "Профессиональный подход, безопасность на высоте. Рекомендую для любых праздников!",
//   "Заказывали салют на корпоратив - получилось невероятно красиво! Все коллеги были в восторге.",
//   "Безопасный запуск, качественные фейерверки. Рекомендую для любых торжеств!"
// ];

/**
 * Получить случайного автора отзыва - функция убрана для избежания рисков с SEO
 */
// export function getRandomReviewAuthor(): string {
//   return REVIEW_AUTHORS[Math.floor(Math.random() * REVIEW_AUTHORS.length)];
// }

/**
 * Получить случайный текст отзыва - функция убрана для избежания рисков с SEO
 */
// export function getRandomReviewText(): string {
//   return REVIEW_TEXTS[Math.floor(Math.random() * REVIEW_TEXTS.length)];
// }

/**
 * Получить отзыв с локализацией для города - функция убрана для избежания рисков с SEO
 */
// export function getLocalizedReview(cityName: string, cityNameLocative: string): {
//   author: string;
//   text: string;
// } {
//   const author = getRandomReviewAuthor();
//   const baseText = getRandomReviewText();
//   
//   // Локализуем текст для города
//   const localizedText = baseText.replace(/на свадьбе|на день рождения|на корпоратив/, `в ${cityNameLocative}`);
//   
//   return {
//     author: `${author.split(' ')[0]} ${author.split(' ')[1][0]}. из ${cityName}`,
//     text: localizedText
//   };
// }

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

/**
 * Константы для типов событий (подборки салютов)
 */
export const EVENT_TYPES = {
  WEDDING: 'wedding',
  BIRTHDAY: 'birthday',
  NEW_YEAR: 'new_year',
} as const;

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES];

/**
 * Названия событий на русском языке
 */
export const EVENT_TYPE_NAMES: Record<EventType, string> = {
  [EVENT_TYPES.WEDDING]: 'Свадьба',
  [EVENT_TYPES.BIRTHDAY]: 'День Рождения',
  [EVENT_TYPES.NEW_YEAR]: 'Новый Год',
};

/**
 * Изображения для подборок событий
 * Можно использовать URL из public/images или внешние ссылки
 */
export const EVENT_TYPE_IMAGES: Record<EventType, string> = {
  [EVENT_TYPES.WEDDING]: 'https://gqnwyyinswqoustiqtpk.supabase.co/storage/v1/object/public/category-images/podborka-svadba.webp',
  [EVENT_TYPES.BIRTHDAY]: 'https://gqnwyyinswqoustiqtpk.supabase.co/storage/v1/object/public/category-images/podborka-happy-birthday.webp',
  [EVENT_TYPES.NEW_YEAR]: 'https://gqnwyyinswqoustiqtpk.supabase.co/storage/v1/object/public/category-images/podvorka-new-year.webp',
};

/**
 * Получить название события на русском языке
 */
export function getEventTypeName(eventType: EventType): string {
  return EVENT_TYPE_NAMES[eventType] || eventType;
}

/**
 * Получить все доступные типы событий
 */
export function getAllEventTypes(): EventType[] {
  return Object.values(EVENT_TYPES);
}

/**
 * Проверить, является ли значение валидным типом события
 */
export function isValidEventType(value: string): value is EventType {
  return Object.values(EVENT_TYPES).includes(value as EventType);
}