# Настройка IndexNow для Яндекса

## Что такое IndexNow

IndexNow - это протокол, который позволяет автоматически уведомлять Яндекс о изменениях на вашем сайте (новые страницы, обновления, удаления) без ожидания обычного обхода поискового робота.

## Что уже настроено

### 1. Ключ IndexNow
- **Ключ**: `5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk`
- **Файл**: `public/5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk.txt`
- **URL**: `https://salutgrad.ru/5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk.txt`

### 2. API утилиты
- `lib/indexnow.ts` - основные функции для работы с IndexNow
- `app/api/indexnow/route.ts` - API endpoint для отправки URL

### 3. Функции для автоматической отправки
- `submitSingleUrl()` - отправка одного URL
- `submitMultipleUrls()` - отправка нескольких URL
- `submitProductUrl()` - отправка URL продукта
- `submitCategoryUrl()` - отправка URL категории
- `submitMainPages()` - отправка основных страниц

## Как использовать

### 1. Отправка одного URL
```typescript
import { submitSingleUrl } from '@/lib/indexnow';

const result = await submitSingleUrl('https://salutgrad.ru/product/some-product');
console.log(result); // { success: true, status: 202, message: 'URL успешно отправлен в Яндекс' }
```

### 2. Отправка нескольких URL
```typescript
import { submitMultipleUrls } from '@/lib/indexnow';

const urls = [
  'https://salutgrad.ru/product/product1',
  'https://salutgrad.ru/product/product2',
  'https://salutgrad.ru/category/category1'
];

const result = await submitMultipleUrls(urls);
```

### 3. Через API endpoint
```bash
# Отправка одного URL
GET /api/indexnow?url=https://salutgrad.ru/product/some-product

# Отправка основных страниц
GET /api/indexnow?action=main

# Отправка нескольких URL (POST)
POST /api/indexnow
{
  "urls": [
    "https://salutgrad.ru/product/1",
    "https://salutgrad.ru/product/2"
  ]
}
```

## Автоматическая интеграция

### При создании/обновлении продукта
```typescript
// В вашем коде создания продукта
import { submitProductUrl } from '@/lib/indexnow';

// После создания продукта
await submitProductUrl(productSlug, baseUrl);
```

### При создании/обновлении категории
```typescript
// В вашем коде создания категории
import { submitCategoryUrl } from '@/lib/indexnow';

// После создания категории
await submitCategoryUrl(categorySlug, baseUrl);
```

## Тестирование

### 1. Проверка файла с ключом
```bash
curl https://salutgrad.ru/5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk.txt
```

### 2. Запуск тестового скрипта
```bash
node scripts/test-indexnow.js
```

### 3. Ручная отправка URL
```bash
# Через API
curl "https://salutgrad.ru/api/indexnow?url=https://salutgrad.ru/"

# Прямо в Яндекс
curl "https://yandex.com/indexnow?url=https://salutgrad.ru/&key=5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk&host=salutgrad.ru"
```

## Мониторинг и отладка

### Коды ответов
- **202 Accepted** - URL успешно принят Яндексом
- **400 Bad Request** - неверные параметры
- **403 Forbidden** - неверный ключ или хост
- **429 Too Many Requests** - превышен лимит запросов

### Логирование
Все функции возвращают объект с информацией о результате:
```typescript
{
  success: boolean,
  status: number,
  message: string
}
```

## Рекомендации

1. **Не отправляйте URL слишком часто** - Яндекс может ограничить количество запросов
2. **Отправляйте только значимые изменения** - новые продукты, обновленные страницы
3. **Используйте batch отправку** - для множественных URL используйте POST метод
4. **Проверяйте статус ответа** - 202 означает успешную отправку

## Полезные ссылки

- [Документация Яндекса по IndexNow](https://yandex.com/support/webmaster/indexnow.html)
- [Требования к ключу](https://yandex.com/support/webmaster/indexnow.html#key-requirements)
- [API Reference](https://yandex.com/support/webmaster/indexnow.html#api)

## Troubleshooting

### Проблема: Файл с ключом не найден
**Решение**: Убедитесь, что файл `public/5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk.txt` существует и доступен по URL `https://salutgrad.ru/5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk.txt`

### Проблема: Статус 403 Forbidden
**Решение**: Проверьте правильность ключа и хоста в запросе

### Проблема: Статус 429 Too Many Requests
**Решение**: Уменьшите частоту отправки URL, добавьте задержки между запросами

