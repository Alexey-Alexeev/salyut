# 🔐 Настройка переменных окружения

## 📋 Список необходимых переменных

### 🌐 **Supabase (обязательно):**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 🗄️ **База данных:**
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### 🤖 **Telegram Bot (только серверные переменные!):**
```
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
```

**⚠️ ВАЖНО:** НЕ используйте `NEXT_PUBLIC_` для Telegram токенов!
Токены должны быть только на сервере, иначе они попадут в браузер пользователя.

### 🗺️ **Yandex Maps:**
```
NEXT_PUBLIC_YANDEX_API_KEY=your-maps-api-key
```

### 📍 **DaData (автодополнение адресов, опционально):**
```
NEXT_PUBLIC_DADATA_TOKEN=your-dadata-token
```

### 📊 **Google Analytics (опционально):**
```
NEXT_PUBLIC_GA_ID=your-ga-id
```

### 🔄 **Кэширование (автоматически):**
```
SITE_VERSION=123-abc123def456  # Автоматически в GitHub Actions
BUILD_ID=build-123-abc123def456  # Автоматически в GitHub Actions
```

**Примечание:** Эти переменные используются для генерации файла `version.json`, который помогает сбрасывать кэш браузера при обновлении сайта.

## 🛠️ Настройка в GitHub Secrets

### 1. **Перейдите в настройки репозитория:**
- GitHub → Settings → Secrets and variables → Actions

### 2. **Добавьте каждую переменную:**
- Нажмите "New repository secret"
- Введите имя переменной (например, `NEXT_PUBLIC_SUPABASE_URL`)
- Введите значение
- Нажмите "Add secret"

### 3. **Проверьте список секретов:**
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ DATABASE_URL
✅ TELEGRAM_BOT_TOKEN
✅ TELEGRAM_CHAT_ID
✅ NEXT_PUBLIC_YANDEX_API_KEY
✅ NEXT_PUBLIC_DADATA_TOKEN (опционально)
✅ FTP_SERVER
✅ FTP_USERNAME
✅ FTP_PASSWORD
✅ FTP_SERVER_DIR
🔄 SITE_VERSION (автоматически)
🔄 BUILD_ID (автоматически)
```

## 🔧 Локальная разработка

### 1. **Создайте файл `.env.local`:**
```bash
# В корне проекта salyut/
touch .env.local
```

### 2. **Добавьте переменные:**
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-url
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
NEXT_PUBLIC_YANDEX_API_KEY=your-maps-key
NEXT_PUBLIC_DADATA_TOKEN=your-dadata-token

# Для локальной разработки (опционально)
SITE_VERSION=local-dev-$(date +%s)
BUILD_ID=local-build-$(date +%s)
```

### 3. **Перезапустите сервер разработки:**
```bash
npm run dev
```

## 🚨 Безопасность

### ❌ **НЕ делайте:**
- Не коммитьте `.env.local` в Git
- Не публикуйте секреты в коде
- Не делитесь секретами в чатах

### ✅ **Делайте:**
- Используйте GitHub Secrets для CI/CD
- Храните секреты в безопасном месте
- Регулярно меняйте пароли
- Используйте разные секреты для dev/prod

## 🔍 Проверка переменных

### **В коде:**
```typescript
// Проверка переменной
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}
```

### **В консоли:**
```bash
# Проверка переменных
echo $NEXT_PUBLIC_SUPABASE_URL
```

## 📞 Получение значений

### **Supabase:**
1. Перейдите в проект Supabase
2. Settings → API
3. Скопируйте URL и ключи

### **Telegram Bot:**
1. Напишите @BotFather в Telegram
2. Создайте нового бота
3. Получите токен

### **Yandex Maps:**
1. Перейдите в Yandex Cloud
2. Создайте API ключ
3. Скопируйте ключ

### **DaData:**
1. Перейдите на [dadata.ru](https://dadata.ru/)
2. Зарегистрируйтесь или войдите
3. Перейдите в личный кабинет → API
4. Скопируйте токен для API "Подсказки адресов"
5. Добавьте токен в GitHub Secrets как `NEXT_PUBLIC_DADATA_TOKEN`

---
**Важно:** Все переменные должны быть настроены до первого деплоя!
