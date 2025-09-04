# 🚀 Инструкции по развертыванию

## Подготовка к развертыванию

### 1. Подготовка сервера

#### Обновление системы

```bash
sudo apt update && sudo apt upgrade -y
```

#### Установка Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Установка PM2 для управления процессами

```bash
sudo npm install -g pm2
```

#### Установка Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2. Настройка базы данных Supabase

1. Создайте проект в [Supabase](https://supabase.com)
2. Получите URL и API ключи из настроек проекта
3. Создайте базу данных PostgreSQL
4. Выполните миграции:

```bash
# В локальной среде
npm run db:push
npm run db:seed
```

### 3. Настройка переменных окружения

Создайте файл `.env.local` на сервере:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_connection_string

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Cloudflare Stream Configuration
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
```

## Развертывание на VPS

### 1. Клонирование репозитория

```bash
cd /var/www
sudo git clone <your-repository-url> fireworks-store
sudo chown -R $USER:$USER fireworks-store
cd fireworks-store
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Сборка приложения

```bash
npm run build
```

### 4. Настройка PM2

Создайте файл `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'fireworks-store',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/fireworks-store',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};
```

### 5. Запуск приложения

```bash
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

### 6. Настройка Nginx

Создайте конфигурационный файл:

```bash
sudo nano /etc/nginx/sites-available/fireworks-store
```

Содержимое файла:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Редирект с HTTP на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL сертификаты (если используете Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Проксирование к Next.js приложению
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Статические файлы
    location /_next/static {
        alias /var/www/fireworks-store/.next/static;
        expires 365d;
        access_log off;
    }

    # Кэширование изображений
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/fireworks-store /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Настройка SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 8. Настройка автоматического обновления SSL

```bash
sudo crontab -e
```

Добавьте строку:

```
0 12 * * * /usr/bin/certbot renew --quiet
```

## Настройка Telegram бота

### 1. Создание бота

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните токен бота

### 2. Получение Chat ID

1. Добавьте бота в чат/канал
2. Отправьте сообщение в чат
3. Перейдите по ссылке: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Найдите `chat_id` в ответе

### 3. Настройка переменных окружения

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## Настройка Cloudflare Stream

### 1. Создание аккаунта

1. Зарегистрируйтесь на [Cloudflare](https://cloudflare.com)
2. Активируйте Stream в панели управления

### 2. Получение API токенов

1. Перейдите в настройки аккаунта
2. Создайте API токен с правами на Stream
3. Сохраните Account ID и API Token

### 3. Настройка переменных окружения

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

## Мониторинг и обслуживание

### 1. Просмотр логов

```bash
# Логи приложения
pm2 logs fireworks-store

# Логи Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Мониторинг ресурсов

```bash
# Статус PM2 процессов
pm2 status

# Использование ресурсов
pm2 monit

# Системные ресурсы
htop
```

### 3. Обновление приложения

```bash
cd /var/www/fireworks-store
git pull origin main
npm install
npm run build
pm2 restart fireworks-store
```

### 4. Резервное копирование

Создайте скрипт для автоматического резервного копирования:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/fireworks-store"
DATE=$(date +%Y%m%d_%H%M%S)

# Создание директории для бэкапов
mkdir -p $BACKUP_DIR

# Бэкап кода
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /var/www/fireworks-store

# Бэкап базы данных (если используете локальную БД)
# pg_dump your_database > $BACKUP_DIR/db_$DATE.sql

# Удаление старых бэкапов (старше 7 дней)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

Добавьте в crontab:

```
0 2 * * * /path/to/backup-script.sh
```

## Безопасность

### 1. Настройка файрвола

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Регулярные обновления

```bash
# Автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 3. Мониторинг безопасности

```bash
# Установка fail2ban
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Устранение неполадок

### 1. Приложение не запускается

```bash
# Проверка логов
pm2 logs fireworks-store

# Проверка переменных окружения
pm2 env fireworks-store

# Перезапуск приложения
pm2 restart fireworks-store
```

### 2. Проблемы с Nginx

```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx

# Просмотр логов ошибок
sudo tail -f /var/log/nginx/error.log
```

### 3. Проблемы с базой данных

```bash
# Проверка подключения к Supabase
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your_anon_key"
```

## Производительность

### 1. Оптимизация Nginx

Добавьте в конфигурацию Nginx:

```nginx
# Кэширование статических файлов
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Gzip сжатие
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

### 2. Мониторинг производительности

```bash
# Установка monitoring tools
sudo apt install htop iotop nethogs -y
```

### 3. Оптимизация Next.js

В `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['images.pexels.com', 'your-domain.com'],
  },
  compress: true,
};

module.exports = nextConfig;
```
