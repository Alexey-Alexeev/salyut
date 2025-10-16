# 🎆 Salyut - Интернет-магазин фейерверков

Современный интернет-магазин фейерверков с полным функционалом электронной коммерции, административной панелью и системой уведомлений через Telegram.

**🌐 Основной домен:** [salutgrad.ru](https://salutgrad.ru)  
**🔄 Старый домен:** салютград.рф (редиректит на новый)

## 🚀 Технологический стек

- **Framework**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI
- **Notifications**: Sonner + Telegram Bot API
- **Maps**: Yandex Maps API
- **Video**: Cloudflare Stream

## ✨ Основные возможности

### 🛍️ Для покупателей

- 📱 **Адаптивный дизайн** - оптимизирован для всех устройств
- 🛒 **Интерактивная корзина** - без перезагрузки страницы
- 🔍 **Умный поиск и фильтрация** - по категориям, цене, производителю
- 📋 **Простое оформление заказов** - с валидацией данных
- 🚚 **Расчет доставки** - автоматический расчет расстояния от МКАД
- 💬 **Консультации** - плавающая кнопка для связи
- 📹 **Видеоотзывы** - реальные отзывы клиентов
- 🎯 **SEO оптимизация** - для лучшего поиска в Google

### 🔧 Для администраторов

- 🔐 **Защищенная панель** - безопасный доступ к управлению
- 📊 **Аналитика продаж** - статистика и отчеты
- 📦 **Управление товарами** - добавление, редактирование, удаление
- 🏷️ **Категории и производители** - полное управление каталогом
- 📋 **Обработка заказов** - изменение статусов, комментарии
- 🔔 **Telegram уведомления** - мгновенные уведомления о заказах
- 📈 **Дашборд** - обзор всех ключевых метрик

## 🛠️ Быстрый старт

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd salyut
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_string

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Cloudflare Stream (для видеоотзывов)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 3. Настройка базы данных

```bash
# Применение схемы базы данных
npm run db:push

# Заполнение тестовыми данными
npm run db:seed
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📁 Структура проекта

```
salyut/
├── app/                          # Next.js App Router
│   ├── admin/                   # Административная панель
│   │   ├── orders/              # Управление заказами
│   │   └── login/               # Авторизация
│   ├── api/                     # API маршруты
│   │   ├── orders/              # Обработка заказов
│   │   ├── products/            # Управление товарами
│   │   ├── categories/          # Категории
│   │   ├── consultations/       # Консультации
│   │   └── telegram/            # Telegram webhook
│   ├── cart/                    # Страница корзины
│   ├── catalog/                 # Каталог товаров
│   ├── product/[slug]/          # Страницы товаров
│   ├── delivery/                # Информация о доставке
│   ├── reviews/                 # Видеоотзывы
│   └── services/                # Дополнительные услуги
├── components/                   # React компоненты
│   ├── admin/                   # Компоненты админ-панели
│   ├── catalog/                 # Компоненты каталога
│   ├── layout/                  # Компоненты макета
│   └── ui/                      # UI компоненты (shadcn/ui)
├── db/                          # База данных
│   ├── schema/                  # Drizzle ORM схемы
│   └── migrations/              # Миграции
├── lib/                         # Утилиты и конфигурация
├── hooks/                       # React хуки
└── scripts/                     # Скрипты для разработки
```

## 🗄️ Схема базы данных

### Основные таблицы:

- **categories** - Категории товаров
- **manufacturers** - Производители
- **products** - Товары с полным описанием
- **orders** - Заказы клиентов
- **order_items** - Элементы заказов
- **completed_orders** - Завершенные заказы
- **completed_order_items** - Элементы завершенных заказов

## 🔔 Система уведомлений

### Telegram интеграция

- **Мгновенные уведомления** о новых заказах
- **Детальная информация** о клиенте и товарах
- **Быстрые команды** для управления заказами
- **Безопасный доступ** только для авторизованных пользователей

### Пример уведомления:

```
🎆 Новый заказ!

🆔 Заказ: #abc12345
👤 Клиент: Иван Петров
📞 Телефон: +7 (977) 360-20-08
📱 Telegram: @ivan_petrov

🛒 Товары:
• Римская свеча "Золотой дождь" - 2 шт. × 1,500 ₽
• Петарды "Корсар-1" - 1 шт. × 2,300 ₽

💰 Итого: 5,300 ₽
💬 Комментарий: Доставка на дачу

⏰ Время: 27.08.2025, 14:30
```

## 🚀 Развертывание

### На VPS (Reg.ru)

Подробные инструкции по развертыванию смотрите в [DEPLOYMENT.md](DEPLOYMENT.md)

### Основные шаги:

1. **Подготовка сервера** - Node.js, PM2, Nginx
2. **Настройка базы данных** - Supabase проект
3. **Конфигурация Telegram** - создание бота
4. **SSL сертификаты** - Let's Encrypt
5. **Мониторинг** - логи и производительность

## 🎨 Кастомизация

### Изменение цветовой схемы

Отредактируйте `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316', // Оранжевый для фейерверков
        },
      },
    },
  },
};
```

### Добавление новых функций

- **Новые страницы** - создайте в папке `app/`
- **API маршруты** - добавьте в `app/api/`
- **Компоненты** - используйте папку `components/`
- **Стили** - Tailwind CSS + shadcn/ui

## 📱 Адаптивность

Проект полностью адаптивен:

- 📱 **Мобильные** (320px+) - приоритетный дизайн
- 📱 **Планшеты** (768px+) - оптимизированная навигация
- 💻 **Десктопы** (1024px+) - полный функционал
- 🖥️ **Большие экраны** (1440px+) - расширенный интерфейс

## 🔒 Безопасность

- ✅ **Валидация форм** - Zod схемы для всех данных
- ✅ **Защита API** - проверка авторизации
- ✅ **RLS в Supabase** - безопасность на уровне БД
- ✅ **Валидация возраста** - подтверждение 18+
- ✅ **HTTPS** - шифрование всех соединений

## 📈 SEO и производительность

- ✅ **Семантическая разметка** - правильная структура HTML
- ✅ **Meta теги** - уникальные для каждой страницы
- ✅ **Sitemap.xml** - автоматическая генерация
- ✅ **Robots.txt** - настройка для поисковиков
- ✅ **Оптимизация изображений** - WebP формат
- ✅ **Lazy loading** - ленивая загрузка контента

## 🧪 Тестирование

### Доступные скрипты:

```bash
# Тестирование API
npm run test:api

# Тестирование базы данных
npm run test:db

# Тестирование создания заказов
npm run test:order

# Настройка Telegram
npm run setup:telegram
```

## 📊 Мониторинг

### Логи и диагностика:

- **PM2 логи** - `pm2 logs salyut`
- **Nginx логи** - `/var/log/nginx/`
- **API диагностика** - `/api/test`
- **Telegram статус** - встроенная проверка

## 🤝 Поддержка

### Полезные ссылки:

- [Документация Next.js](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

### Устранение неполадок:

1. **Проверьте переменные окружения**
2. **Убедитесь в подключении к Supabase**
3. **Проверьте настройки Telegram**
4. **Просмотрите логи приложения**

## 📄 Лицензия

MIT License - свободное использование и модификация.

## 🙏 Благодарности

- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com) - UI компоненты
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
- [Telegram Bot API](https://core.telegram.org/bots/api) - уведомления

---

**🎆 Salyut** - современный интернет-магазин фейерверков с полным функционалом электронной коммерции!