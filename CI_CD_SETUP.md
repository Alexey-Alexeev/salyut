# 🚀 Настройка CI/CD для автоматического деплоя в РЕГ.РУ

## 📋 Обзор

Настроен автоматический деплой через GitHub Actions при пуше в ветку `master` или `main`.

## 🔧 Настройка GitHub Secrets

В настройках репозитория GitHub (`Settings` → `Secrets and variables` → `Actions`) добавьте следующие секреты:

### 🌐 **FTP настройки РЕГ.РУ:**
```
FTP_SERVER=ftp.your-domain.ru
FTP_USERNAME=your-ftp-username
FTP_PASSWORD=your-ftp-password
FTP_SERVER_DIR=/public_html
```

### 🔑 **Переменные окружения:**
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=your-database-url
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
YANDEX_MAPS_API_KEY=your-yandex-maps-api-key
```

## 🛠️ Получение FTP данных в РЕГ.РУ

### 1. **Войдите в панель управления РЕГ.РУ**
- Перейдите в раздел "Хостинг"
- Выберите ваш домен

### 2. **Найдите FTP данные:**
- **FTP сервер**: `ftp.your-domain.ru` или IP адрес
- **Логин**: обычно `your-domain.ru` или `ftp@your-domain.ru`
- **Пароль**: пароль от хостинга
- **Директория**: `/public_html` или `/www`

### 3. **Проверьте права доступа:**
- Убедитесь, что FTP пользователь имеет права на запись
- Проверьте, что директория `/public_html` доступна для записи

## 📁 Структура деплоя

### ✅ **Что загружается:**
- `out/` - собранные статические файлы
- Все HTML, CSS, JS файлы
- Изображения и иконки
- Sitemap.xml и robots.txt

### ❌ **Что исключается:**
- Исходный код (`.tsx`, `.ts`, `.js`)
- `node_modules/`
- Конфигурационные файлы
- Документация
- `.git/` и `.github/`

## 🔄 Процесс деплоя

### 1. **Автоматический запуск:**
```bash
git push origin master
```

### 2. **Что происходит:**
1. ✅ Клонирование репозитория
2. ✅ Установка Node.js 18
3. ✅ Установка зависимостей (`npm ci`)
4. ✅ Сборка проекта (`npm run build`)
5. ✅ Загрузка файлов на FTP сервер РЕГ.РУ
6. ✅ Уведомление о результате

### 3. **Время деплоя:** ~2-3 минуты

## 🚨 Устранение проблем

### **Ошибка FTP подключения:**
```bash
# Проверьте данные FTP в РЕГ.РУ
# Убедитесь, что сервер доступен
# Проверьте логин и пароль
```

### **Ошибка прав доступа:**
```bash
# В панели РЕГ.РУ проверьте права FTP пользователя
# Убедитесь, что директория /public_html доступна для записи
```

### **Ошибка сборки:**
```bash
# Проверьте переменные окружения
# Убедитесь, что все секреты настроены
# Проверьте логи GitHub Actions
```

## 📊 Мониторинг

### **Проверка статуса:**
- GitHub → Actions → Deploy to REG.RU
- Зеленый ✅ = успешно
- Красный ❌ = ошибка

### **Логи деплоя:**
- Нажмите на последний запуск
- Просмотрите логи каждого шага
- Найдите причину ошибки

## 🔧 Альтернативные варианты

### **Если FTP не работает:**

#### 1. **SSH деплой:**
```yaml
- name: Deploy via SSH
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.SSH_HOST }}
    username: ${{ secrets.SSH_USERNAME }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    script: |
      cd /path/to/your/site
      git pull origin master
      npm ci
      npm run build
```

#### 2. **rsync деплой:**
```yaml
- name: Deploy via rsync
  run: |
    rsync -avz --delete salyut/out/ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/path/to/site/
```

## 🎯 Рекомендации

### **Безопасность:**
- ✅ Используйте сильные пароли для FTP
- ✅ Регулярно меняйте пароли
- ✅ Не коммитьте секреты в код

### **Производительность:**
- ✅ Используйте `.gitignore` для исключения ненужных файлов
- ✅ Настройте кеширование в GitHub Actions
- ✅ Оптимизируйте размер сборки

### **Мониторинг:**
- ✅ Настройте уведомления в Telegram
- ✅ Проверяйте логи деплоя
- ✅ Тестируйте сайт после деплоя

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи GitHub Actions
2. Убедитесь в правильности FTP данных
3. Проверьте права доступа в РЕГ.РУ
4. Обратитесь в поддержку РЕГ.РУ при необходимости

---
**Дата создания:** $(date)
**Версия:** 1.0
