# 🚀 Настройка Supabase Edge Functions для Telegram

## 📋 Обзор

Используем Supabase Edge Functions для безопасной отправки Telegram уведомлений без раскрытия токенов в клиентском коде.

## 🔧 Настройка

### 1. Установка Supabase CLI

```bash
# Установка через npm
npm install -g supabase

# Или через другие пакетные менеджеры
# https://supabase.com/docs/guides/cli/getting-started
```

### 2. Инициализация проекта

```bash
# В корне проекта
supabase init
```

### 3. Логин в Supabase

```bash
supabase login
```

### 4. Связывание с проектом

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### 5. Настройка переменных окружения

```bash
# Установка секретов для Edge Functions
supabase secrets set TELEGRAM_BOT_TOKEN=your-bot-token
supabase secrets set TELEGRAM_CHAT_ID=your-chat-id
```

### 6. Деплой Edge Function

```bash
# Деплой функции
supabase functions deploy send-telegram-notification

# Проверка статуса
supabase functions list
```

## 🔐 Безопасность

### ✅ Преимущества:

1. **Секретные токены** остаются на сервере Supabase
2. **Не попадают в браузер** - полная безопасность
3. **Работает со статическим экспортом** - не нужен Next.js сервер
4. **Централизованная логика** - все уведомления в одном месте
5. **Масштабируемость** - Edge Functions автоматически масштабируются

### 🛡️ Переменные окружения:

```bash
# ✅ БЕЗОПАСНО - только на сервере Supabase
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

## 📝 Использование

### В клиентском коде:

```typescript
// Отправка уведомления о заказе
const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
    body: {
        type: 'order',
        data: { order, items }
    }
});

// Отправка уведомления о консультации
const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
    body: {
        type: 'consultation',
        data: { consultation }
    }
});
```

## 🔄 Обновление GitHub Actions

### Удалите из workflow:

```yaml
# ❌ УДАЛИТЬ - больше не нужны
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN: ${{ secrets.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN }}
NEXT_PUBLIC_TELEGRAM_CHAT_ID: ${{ secrets.NEXT_PUBLIC_TELEGRAM_CHAT_ID }}
```

### Оставьте только:

```yaml
# ✅ ОСТАВИТЬ - нужны для Supabase
NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## 🧪 Тестирование

### Локальное тестирование:

```bash
# Запуск локального сервера Edge Functions
supabase functions serve

# Тестирование функции
curl -X POST 'http://localhost:54321/functions/v1/send-telegram-notification' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"type": "consultation", "data": {"consultation": {"id": "test", "name": "Test", "contact_info": "test@example.com"}}}'
```

### Проверка в продакшене:

```bash
# Проверка логов
supabase functions logs send-telegram-notification

# Проверка статуса
supabase functions list
```

## 📚 Документация

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Runtime](https://deno.land/manual)
- [Telegram Bot API](https://core.telegram.org/bots/api)

## 🎯 Результат

✅ **Полная безопасность** - токены не попадают в браузер  
✅ **Работает со статическим экспортом** - не нужен Next.js сервер  
✅ **Масштабируемость** - автоматическое масштабирование  
✅ **Централизованная логика** - все уведомления в одном месте  


