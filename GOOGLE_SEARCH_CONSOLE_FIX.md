# Исправление предупреждений Google Search Console

## Проблема
Google Search Console выдавал предупреждения о ценах категорий, потому что в JSON-LD разметке категории были представлены как `Product` с ценами, что неправильно.

## Решение

### 1. Изменена JSON-LD разметка для категорий
- **Было**: Категории представлены как `Product` с `AggregateOffer` и ценами
- **Стало**: Категории представлены как `Category` без цен

### 2. Исправлена JSON-LD разметка в каталоге
- Категории в каталоге больше не представлены как товары с ценами
- Товары в каталоге правильно представлены как `Product` с ценами
- Сохранена единая структура каталога с фильтрами

### 3. Обновлены ссылки
- Компонент `CategoryCard` ведет на `/catalog?category=[slug]`
- Обновлены ссылки в JSON-LD разметке

## Измененные файлы

### Основные изменения:
1. `app/page.tsx` - исправлена JSON-LD разметка для главной страницы
2. `app/[city]/page.tsx` - исправлена JSON-LD разметка для страниц городов
3. `components/category-card.tsx` - обновлены ссылки
4. `lib/schema-constants.ts` - добавлены функции для работы с ценами категорий

### Структура JSON-LD теперь:

#### Для категорий (на главной и городских страницах):
```json
{
  "@type": "Category",
  "name": "Название категории",
  "description": "Описание категории",
  "url": "https://salutgrad.ru/category/slug",
  "image": "https://gqnwyyinswqoustiqtpk.supabase.co/storage/v1/object/public/category-images/category-name.webp"
}
```

#### Для товаров (в каталоге):
```json
{
  "@type": "Product",
  "name": "Название товара",
  "offers": {
    "@type": "Offer",
    "price": 1500,
    "priceCurrency": "RUB",
    "shippingDetails": {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "500",
        "currency": "RUB"
      },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "businessDays": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
        },
        "cutoffTime": "14:00"
      },
      "shippingDestination": {
        "@type": "DefinedRegion",
        "addressCountry": "RU"
      }
    },
    "hasMerchantReturnPolicy": {
      "@type": "MerchantReturnPolicy",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 7,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility"
    }
  }
}
```

## Результат
- Google Search Console больше не будет видеть категории как товары с ценами
- Каталог работает с фильтрами по категориям через URL параметры
- Используются реальные изображения категорий из Supabase Storage
- Добавлены поля `shippingDetails` и `hasMerchantReturnPolicy` для всех товаров
- Структурированные данные соответствуют стандартам Schema.org

## Проверка
После деплоя проверьте в Google Search Console:
1. Отсутствие предупреждений о ценах категорий
2. Корректное отображение товаров в результатах поиска
3. Правильная индексация каталога с фильтрами
