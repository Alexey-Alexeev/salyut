# FireWorks - Интернет-магазин фейерверков

Полнофункциональный интернет-магазин фейерверков с административной панелью, построенный на современном стеке технологий.

## 🚀 Технологии

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **UI Components**: Radix UI
- **Notifications**: Sonner

## ✨ Возможности

### Для пользователей:

- 📱 Адаптивный дизайн (mobile-first)
- 🛍️ Просмотр каталога товаров с фильтрацией и сортировкой
- 🔍 Поиск по товарам
- 🛒 Интерактивная корзина без перезагрузки страницы
- 📋 Оформление заказов с валидацией
- 💬 Плавающая кнопка консультации
- 📹 Видеоотзывы клиентов
- 🎯 SEO оптимизация

### Для администраторов:

- 🔐 Защищенная административная панель
- 📊 Дашборд со статистикой
- 📦 Управление товарами (CRUD)
- 🏷️ Управление категориями
- 📋 Обработка заказов
- 📈 Аналитика продаж
- 🔔 Уведомления о новых заказах

## 🛠️ Установка и настройка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd firee-main
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_string

# Telegram Bot Configuration (для уведомлений о заказах)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
TELEGRAM_ADMIN_USER_ID=your_telegram_user_id

# Cloudflare Stream Configuration (для видеоотзывов)
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 4. Настройка Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Получите URL и API ключи из настроек проекта
3. Создайте базу данных PostgreSQL
4. Выполните миграции:

```bash
npx drizzle-kit push
```

### 5. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 📁 Структура проекта

```
firee-main/
├── app/                    # Next.js App Router
│   ├── admin/             # Административная панель
│   ├── api/               # API маршруты
│   ├── cart/              # Страница корзины
│   ├── catalog/           # Каталог товаров
│   ├── product/           # Страницы товаров
│   └── globals.css        # Глобальные стили
├── components/            # React компоненты
│   ├── admin/             # Компоненты админ-панели
│   ├── layout/            # Компоненты макета
│   └── ui/                # UI компоненты (shadcn/ui)
├── db/                    # Схема базы данных
│   ├── schema/            # Drizzle ORM схемы
│   └── migrations/        # Миграции базы данных
├── lib/                   # Утилиты и конфигурация
│   ├── db.ts             # Подключение к базе данных
│   ├── supabase.ts       # Supabase клиент
│   └── cart-store.ts     # Zustand store для корзины
└── hooks/                 # React хуки
```

## 🗄️ Схема базы данных

### Основные таблицы:

- **categories** - Категории товаров
- **manufacturers** - Производители
- **products** - Товары
- **orders** - Заказы
- **order_items** - Элементы заказов
- **profiles** - Профили пользователей
- **reviews** - Видеоотзывы

## 🚀 Развертывание

### На VPS (Reg.ru)

1. **Подготовка сервера:**

   ```bash
   # Обновление системы
   sudo apt update && sudo apt upgrade -y

   # Установка Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Установка PM2
   sudo npm install -g pm2
   ```

2. **Настройка Nginx:**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Развертывание приложения:**

   ```bash
   # Клонирование репозитория
   git clone <repository-url>
   cd firee-main

   # Установка зависимостей
   npm install

   # Сборка приложения
   npm run build

   # Запуск с PM2
   pm2 start npm --name "fireworks" -- start
   pm2 startup
   pm2 save
   ```

## 🔧 Настройка Telegram уведомлений

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен бота
3. Добавьте бота в чат и получите chat_id
4. Настройте переменные окружения

## 📹 Интеграция с Cloudflare Stream

1. Создайте аккаунт в [Cloudflare](https://cloudflare.com)
2. Активируйте Stream
3. Получите Account ID и API Token
4. Настройте переменные окружения

## 🎨 Кастомизация

### Изменение цветовой схемы

Отредактируйте файл `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316', // Оранжевый для фейерверков
          // ... другие оттенки
        },
      },
    },
  },
};
```

### Добавление новых категорий

1. Добавьте категорию в базу данных
2. Обновите компоненты каталога
3. Добавьте изображения для категорий

## 📱 Адаптивность

Проект полностью адаптивен и оптимизирован для:

- 📱 Мобильные устройства (320px+)
- 📱 Планшеты (768px+)
- 💻 Десктопы (1024px+)
- 🖥️ Большие экраны (1440px+)

## 🔒 Безопасность

- ✅ Валидация всех форм
- ✅ Защита API маршрутов
- ✅ RLS в Supabase
- ✅ Аутентификация администраторов
- ✅ Валидация возраста (18+)

## 📈 SEO оптимизация

- ✅ Семантическая разметка HTML
- ✅ Уникальные meta теги
- ✅ Sitemap.xml и robots.txt
- ✅ Оптимизированные изображения
- ✅ Alt атрибуты для всех изображений
- ✅ Структурированные данные

## 🤝 Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте [Issues](https://github.com/your-repo/issues)
2. Создайте новый Issue с описанием проблемы
3. Обратитесь к документации технологий

## 📄 Лицензия

MIT License - см. файл [LICENSE](LICENSE) для подробностей.

## 🙏 Благодарности

- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com) - UI компоненты
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- [Drizzle ORM](https://orm.drizzle.team) - TypeScript ORM
