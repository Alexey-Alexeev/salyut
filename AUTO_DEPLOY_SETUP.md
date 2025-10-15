# 🚀 Автоматический деплой на Reg.ru через Git

## 📋 Возможности Reg.ru

✅ **Поддерживается:**
- SSH доступ к серверу
- Git репозитории
- Webhook'и для автоматического деплоя
- Node.js приложения
- Статические сайты

---

## 🔧 Настройка автоматического деплоя

### **Вариант 1: Прямой Git деплой (рекомендуется)**

#### **Шаг 1: Подготовка SSH ключа**

```bash
# 1. Создайте SSH ключ (если нет)
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 2. Скопируйте публичный ключ
cat ~/.ssh/id_rsa.pub
```

#### **Шаг 2: Настройка на Reg.ru**

1. **В панели Reg.ru:**
   - Перейдите в "Управление хостингом"
   - Найдите "SSH доступ" 
   - Добавьте ваш публичный SSH ключ

2. **Получите данные для подключения:**
   - SSH хост: `your-domain.com` или IP
   - SSH порт: обычно `22`
   - Пользователь: ваш логин
   - Путь к сайту: `/home/username/public_html`

#### **Шаг 3: Настройка на сервере**

```bash
# 1. Подключитесь к серверу
ssh username@your-domain.com

# 2. Перейдите в папку сайта
cd /home/username/public_html

# 3. Инициализируйте Git репозиторий
git init

# 4. Добавьте удаленный репозиторий (GitHub/GitLab)
git remote add origin https://github.com/your-username/your-repo.git

# 5. Создайте скрипт автоматического деплоя
nano deploy.sh
```

**Содержимое `deploy.sh`:**
```bash
#!/bin/bash
echo "🚀 Начинаем деплой..."

# Получаем последние изменения
git pull origin main

# Устанавливаем зависимости
npm install

# Собираем проект
npm run build

# Копируем статические файлы в public_html
if [ -d "out" ]; then
    echo "📁 Копируем статические файлы..."
    cp -r out/* /home/username/public_html/
    echo "✅ Деплой завершен!"
else
    echo "❌ Папка out не найдена. Проверьте сборку."
fi

echo "🎉 Сайт обновлен!"
```

```bash
# 6. Сделайте скрипт исполняемым
chmod +x deploy.sh

# 7. Запустите первый деплой
./deploy.sh
```

---

### **Вариант 2: GitHub Actions (если поддерживается)**

#### **Создайте файл `.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Reg.ru

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build project
      run: npm run build
    
    - name: Deploy to Reg.ru
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.REG_HOST }}
        username: ${{ secrets.REG_USERNAME }}
        key: ${{ secrets.REG_SSH_KEY }}
        script: |
          cd /home/username/public_html
          git pull origin main
          npm install
          npm run build
          cp -r out/* /home/username/public_html/
```

#### **Настройте секреты в GitHub:**
- `REG_HOST` - хост Reg.ru
- `REG_USERNAME` - имя пользователя
- `REG_SSH_KEY` - приватный SSH ключ

---

### **Вариант 3: Webhook деплой**

#### **Создайте webhook endpoint:**

```javascript
// webhook.js
const express = require('express');
const { exec } = require('child_process');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log('🔄 Получен webhook, начинаем деплой...');
  
  exec('./deploy.sh', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Ошибка деплоя:', error);
      return res.status(500).send('Deploy failed');
    }
    
    console.log('✅ Деплой успешен:', stdout);
    res.status(200).send('Deploy successful');
  });
});

app.listen(3001, () => {
  console.log('🚀 Webhook сервер запущен на порту 3001');
});
```

---

## 🎯 Рекомендуемый процесс

### **Для вашего проекта (Next.js + статический экспорт):**

#### **1. Настройте автоматический деплой:**

```bash
# На сервере Reg.ru создайте скрипт deploy.sh
#!/bin/bash
echo "🚀 Деплой сайта салютов..."

# Переходим в папку проекта
cd /home/username/salyut-project

# Получаем изменения
git pull origin main

# Устанавливаем зависимости
npm install

# Собираем проект
npm run build

# Копируем статические файлы
if [ -d "out" ]; then
    echo "📁 Копируем файлы в public_html..."
    rm -rf /home/username/public_html/*
    cp -r out/* /home/username/public_html/
    echo "✅ Деплой завершен!"
else
    echo "❌ Ошибка: папка out не найдена"
    exit 1
fi

echo "🎉 Сайт обновлен! Проверьте: https://your-domain.com"
```

#### **2. Настройте локальный репозиторий:**

```bash
# Добавьте удаленный репозиторий для деплоя
git remote add deploy ssh://username@your-domain.com/home/username/salyut-project

# Деплой одной командой
git push deploy main
```

#### **3. Автоматизация:**

```bash
# Создайте алиас для быстрого деплоя
echo 'alias deploy="git add . && git commit -m \"Auto deploy\" && git push origin main && git push deploy main"' >> ~/.bashrc
source ~/.bashrc

# Теперь просто:
deploy
```

---

## 📋 Финальная настройка

### **1. Структура на сервере:**
```
/home/username/
├── public_html/          # Публичные файлы сайта
└── salyut-project/       # Исходный код проекта
    ├── .git/
    ├── deploy.sh
    └── ... (весь проект)
```

### **2. Процесс деплоя:**
1. **Локально:** `git push origin main` → GitHub
2. **На сервере:** `git pull` → обновление кода
3. **Автоматически:** `npm run build` → создание `out/`
4. **Автоматически:** копирование в `public_html`

### **3. Мониторинг:**
```bash
# Проверка логов деплоя
tail -f /home/username/salyut-project/deploy.log

# Проверка статуса сайта
curl -I https://your-domain.com
```

---

## ✅ Преимущества автоматического деплоя

- 🚀 **Быстро:** Один `git push` → сайт обновлен
- 🔒 **Безопасно:** Все изменения в Git
- 📝 **Отслеживаемо:** История всех изменений
- 🔄 **Надежно:** Автоматическая сборка и копирование
- ⚡ **Эффективно:** Не нужно вручную загружать файлы

---

**Готово! Теперь ваш сайт будет обновляться автоматически при каждом `git push`! 🎉**
