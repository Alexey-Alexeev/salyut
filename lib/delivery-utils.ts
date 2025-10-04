import { z } from 'zod';

// Константы для расчета доставки
export const DELIVERY_CONSTANTS = {
  // Фиксированная стоимость доставки для Москвы и ближайших городов
  MOSCOW_DELIVERY_COST: 500,

  // Стоимость за каждый км от МКАД для других городов области
  COST_PER_KM: 100,

  // Минимальная стоимость доставки для всех случаев
  MIN_DELIVERY_COST: 500,

  // Адрес самовывоза
  PICKUP_ADDRESS: {
    fullAddress:
      'Рассветная улица, 4, деревня Чёрное, городской округ Балашиха, Московская область, 143921',
    street: 'Рассветная улица, 4',
    settlement: 'деревня Чёрное',
    district: 'городской округ Балашиха',
    region: 'Московская область',
    postalCode: '143921',
    coordinates: {
      lat: 55.740418,
      lng: 38.051935,
    },
  },
} as const;

// Список городов с фиксированной стоимостью доставки
export const FIXED_DELIVERY_CITIES = [
  'москва',
  'moscow',
  'балашиха',
  'balashikha',
  'люберцы',
  'lyubertsy',
] as const;

// Полный список городов Московской области для распознавания
export const MOSCOW_OBLAST_CITIES = [
  'балашиха',
  'бронницы',
  'видное',
  'волоколамск',
  'воскресенск',
  'дмитров',
  'долгопрудный',
  'домодедово',
  'дубна',
  'егорьевск',
  'жуковский',
  'зарайск',
  'истра',
  'кашира',
  'клин',
  'коломна',
  'королёв',
  'котельники',
  'красногорск',
  'лобня',
  'лосино-петровский',
  'луховицы',
  'лыткарино',
  'люберцы',
  'можайск',
  'мытищи',
  'наро-фоминск',
  'ногинск',
  'одинцово',
  'орехово-зуево',
  'павловский посад',
  'подольск',
  'протвино',
  'пушкино',
  'пущино',
  'раменское',
  'реутов',
  'руза',
  'сергиев посад',
  'серпухов',
  'солнечногорск',
  'ступино',
  'талдом',
  'фрязино',
  'химки',
  'черноголовка',
  'чехов',
  'шатура',
  'щёлково',
  'электросталь',
] as const;

// Тип для метода доставки
export type DeliveryMethod = 'delivery' | 'pickup';

// Схема валидации для данных доставки
export const deliveryDataSchema = z.object({
  method: z.enum(['delivery', 'pickup']),
  address: z.string().optional(),
  city: z.string().optional(),
  distanceFromMKAD: z.number().optional(),
});

export type DeliveryData = z.infer<typeof deliveryDataSchema>;

// Интерфейс для результата расчета доставки
export interface DeliveryCalculationResult {
  method: DeliveryMethod;
  cost: number;
  address?: string;
  city?: string;
  distanceFromMKAD?: number;
  description: string;
}

/**
 * Нормализует название города для сравнения
 */
function normalizeCity(city: string): string {
  return city.toLowerCase().trim().replace(/ё/g, 'е').replace(/\s+/g, ' ');
}

/**
 * Проверяет, входит ли город в список с фиксированной стоимостью доставки
 */
export function isFixedDeliveryCity(city: string): boolean {
  const normalized = normalizeCity(city);
  return FIXED_DELIVERY_CITIES.some(
    fixedCity =>
      normalized.includes(fixedCity) || fixedCity.includes(normalized)
  );
}

/**
 * Рассчитывает стоимость доставки в зависимости от города
 */
export function calculateDeliveryCost(
  city: string,
  distanceFromMKAD?: number
): number {
  // Если это город с фиксированной стоимостью (Москва, Балашиха, Люберцы)
  // ВАЖНО: Проверяем это ПЕРВЫМ, независимо от расстояния от МКАД
  if (city && isFixedDeliveryCity(city)) {
    return DELIVERY_CONSTANTS.MOSCOW_DELIVERY_COST;
  }

  // Если указано расстояние от МКАД, используем его (только для НЕ фиксированных городов)
  if (distanceFromMKAD !== undefined) {
    if (distanceFromMKAD <= 0) {
      // Внутри МКАД - фиксированная стоимость
      return DELIVERY_CONSTANTS.MOSCOW_DELIVERY_COST;
    } else {
      // За МКАД: 500₽ базовая стоимость + 100₽ за каждый км
      return (
        DELIVERY_CONSTANTS.MIN_DELIVERY_COST +
        DELIVERY_CONSTANTS.COST_PER_KM * distanceFromMKAD
      );
    }
  }

  // По умолчанию возвращаем минимальную стоимость
  return DELIVERY_CONSTANTS.MIN_DELIVERY_COST;
}

/**
 * Основная функция расчета доставки
 */
export function calculateDelivery(
  data: DeliveryData
): DeliveryCalculationResult {
  if (data.method === 'pickup') {
    return {
      method: 'pickup',
      cost: 0,
      address: DELIVERY_CONSTANTS.PICKUP_ADDRESS.fullAddress,
      description: 'Самовывоз бесплатно',
    };
  }

  // Доставка
  const city = data.city || '';
  const cost = calculateDeliveryCost(city, data.distanceFromMKAD);

  let description = '';
  if (city && isFixedDeliveryCity(city)) {
    const formattedCity = formatCityName(city);
    description = `Доставка в ${formattedCity}: ${cost} ₽ (фиксированная стоимость)`;
  } else if (data.distanceFromMKAD !== undefined) {
    if (data.distanceFromMKAD <= 0) {
      description = `Доставка: ${cost} ₽`;
    } else {
      description = `Доставка (${data.distanceFromMKAD} км от МКАД): 500₽ + ${data.distanceFromMKAD}км × 100₽ = ${cost} ₽`;
    }
  } else {
    description = `Доставка: ${cost} ₽`;
  }

  return {
    method: 'delivery',
    cost,
    address: data.address,
    city,
    distanceFromMKAD: data.distanceFromMKAD,
    description,
  };
}

/**
 * Получает информацию о самовывозе
 */
export function getPickupInfo() {
  return {
    address: DELIVERY_CONSTANTS.PICKUP_ADDRESS,
    description: 'Самовывоз с нашего склада в Балашихе',
    phone: '+7 (977) 360-20-08',
    notes: 'Предварительно позвоните, чтобы уточнить готовность заказа',
  };
}

/**
 * Валидирует данные доставки
 */
export function validateDeliveryData(data: unknown): DeliveryData {
  return deliveryDataSchema.parse(data);
}

/**
 * Извлекает город из адреса с использованием списка городов Московской области
 */
export function extractCityFromAddress(address: string): string {
  if (!address) return '';

  const normalized = address.toLowerCase();

  // Сначала ищем Москву (особый случай)
  if (normalized.includes('москва') || normalized.includes('moscow')) {
    return 'москва';
  }

  // Ищем совпадения с городами Московской области
  // Сортируем по длине (длинные названия проверяем первыми)
  const sortedCities = [...MOSCOW_OBLAST_CITIES].sort(
    (a, b) => b.length - a.length
  );

  for (const city of sortedCities) {
    // Проверяем точное совпадение с границами слов
    const cityRegex = new RegExp(
      `\\b${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i'
    );
    if (cityRegex.test(normalized)) {
      return city;
    }

    // Дополнительная проверка: ищем город в составе фраз типа "городской округ Балашиха"
    const cityInPhraseRegex = new RegExp(
      `(?:городской\\s+округ|муниципальный\\s+округ|г\\.?|город)\\s+${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
      'i'
    );
    if (cityInPhraseRegex.test(normalized)) {
      return city;
    }
  }

  // Специальные паттерны для сложных административных единиц
  const specialPatterns = [
    // "Ленинский городской округ, Видное" или "городской округ, Город"
    /городской\s+округ,\s*([а-яё\-]+)/i,
    // "муниципальный округ Город"
    /муниципальный\s+округ\s+([а-яё\-]+)/i,
    // "г. Название" или "город Название"
    /(?:^|,\s*)(?:г\.?\s+|город\s+)([а-яё\-]+)(?=\s*[,.]|$)/i,
    // После области - только одно слово
    /московская\s+область,\s*([а-яё\-]+)(?=\s*[,.]|$)/i,
    // После любой области - только одно слово
    /область,\s*([а-яё\-]+)(?=\s*[,.]|$)/i,
  ];

  for (const pattern of specialPatterns) {
    const match = address.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim().toLowerCase();
      // Проверяем, что это не служебное слово и что оно есть в списке
      const excludeWords = [
        'область',
        'московская',
        'россия',
        'улица',
        'проспект',
        'переулок',
        'муниципальный',
        'округ',
        'посёлок',
        'деревня',
        'село',
        'посад',
        'дом',
        'квартира',
        'строение',
        'городской',
        'ленинский',
        'школьная',
      ];

      if (
        !excludeWords.includes(candidate) &&
        MOSCOW_OBLAST_CITIES.includes(candidate as any)
      ) {
        return candidate;
      }
    }
  }

  return '';
}

/**
 * Форматирует название города с заглавной буквы
 */
export function formatCityName(city: string): string {
  if (!city) return '';

  // Особые случаи для городов (в винительном падеже для "доставка в...")
  const specialCases: { [key: string]: string } = {
    москва: 'Москву',
    moscow: 'Москву',
    балашиха: 'Балашиху',
    balashikha: 'Балашиху',
    люберцы: 'Люберцы',
    lyubertsy: 'Люберцы',
    мытищи: 'Мытищи',
    королёв: 'Королёв',
    королев: 'Королёв',
    подольск: 'Подольск',
    химки: 'Химки',
    одинцово: 'Одинцово',
    истра: 'Истру',
    дмитров: 'Дмитров',
    клин: 'Клин',
    коломна: 'Коломну',
    долгопрудный: 'Долгопрудный',
    домодедово: 'Домодедово',
    дубна: 'Дубну',
    жуковский: 'Жуковский',
    раменское: 'Раменское',
    'сергиев посад': 'Сергиев Посад',
    щёлково: 'Щёлково',
  };

  const lowerCity = city.toLowerCase();
  if (specialCases[lowerCity]) {
    return specialCases[lowerCity];
  }

  // Для остальных городов - просто с заглавной буквы
  return city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
}

/**
 * Форматирует стоимость доставки для отображения
 */
export function formatDeliveryCost(cost: number): string {
  if (cost === 0) {
    return 'Бесплатно';
  }
  return `${cost.toLocaleString('ru-RU')} ₽`;
}
