# 🔐 Примеры переменных окружения

## ✅ **ПРАВИЛЬНЫЕ переменные:**

### **Публичные (видны в браузере):**
```bash
# Эти переменные безопасно использовать с NEXT_PUBLIC_
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SITE_URL=https://salutgrad.ru
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### **Серверные (только на сервере):**
```bash
# Эти переменные НЕ должны иметь NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://user:password@host:port/database
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
YANDEX_MAPS_API_KEY=your-maps-api-key
GOOGLE_SITE_VERIFICATION=your-verification-code
```

## ❌ **НЕПРАВИЛЬНЫЕ переменные:**

### **ОПАСНО - не используйте NEXT_PUBLIC_ для секретов:**
```bash
# ❌ НИКОГДА не делайте так!
NEXT_PUBLIC_TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz  # ОПАСНО!
NEXT_PUBLIC_TELEGRAM_CHAT_ID=123456789                                # ОПАСНО!
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # ОПАСНО!
NEXT_PUBLIC_DATABASE_URL=postgresql://user:password@host:port/database  # ОПАСНО!
```

## 🔍 **Как проверить:**

### **В коде:**
```typescript
// ✅ ПРАВИЛЬНО - серверные переменные
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

// ✅ ПРАВИЛЬНО - публичные переменные
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// ❌ НЕПРАВИЛЬНО - не делайте так
const dangerousToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN; // ОПАСНО!
```

### **В браузере:**
```javascript
// ✅ Безопасно - эти переменные должны быть видны
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);

// ❌ Опасно - эти переменные НЕ должны быть видны
console.log(process.env.TELEGRAM_BOT_TOKEN); // undefined (хорошо!)
```

## 🛡️ **Правила безопасности:**

### **Используйте NEXT_PUBLIC_ только для:**
- ✅ URL API (Supabase, внешние сервисы)
- ✅ Публичные ключи (Supabase anon key)
- ✅ ID трекинга (Google Analytics)
- ✅ Настройки сайта (URL, название)

### **НЕ используйте NEXT_PUBLIC_ для:**
- ❌ Секретных токенов (Telegram, Discord)
- ❌ Паролей баз данных
- ❌ Приватных ключей
- ❌ API ключей с правами записи

## 🧪 **Тестирование:**

### **Проверьте скриптом:**
```bash
npm run test:deploy
```

### **Проверьте в браузере:**
```javascript
// Откройте DevTools → Console
console.log('Публичные переменные:');
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

console.log('Серверные переменные (должны быть undefined):');
console.log('Telegram Token:', process.env.TELEGRAM_BOT_TOKEN); // undefined ✅
console.log('Database URL:', process.env.DATABASE_URL); // undefined ✅
```

## 📋 **Итоговый список:**

### **GitHub Secrets (для CI/CD):**
```
FTP_SERVER=ftp.your-domain.ru
FTP_USERNAME=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_SERVER_DIR=/public_html
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-url
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
YANDEX_MAPS_API_KEY=your-maps-key
```

### **Локальная разработка (.env.local):**
```bash
# Публичные переменные
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Серверные переменные
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=your-database-url
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_CHAT_ID=your-chat-id
YANDEX_MAPS_API_KEY=your-maps-key
```

---
**Помните:** Безопасность превыше всего! 🔒
