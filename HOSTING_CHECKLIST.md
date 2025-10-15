# 🚀 Чек-лист для загрузки на хостинг

## 📅 Дата: 15 октября 2025

---

## ❌ Файлы, которые НЕ нужно загружать на хостинг

### 1. **Системные файлы и папки (уже в .gitignore)**
```
✅ .git/                    # Git репозиторий
✅ .next/                   # Собранные файлы Next.js
✅ node_modules/            # Зависимости
✅ .vscode/                 # Настройки VS Code
✅ .idea/                   # Настройки IDE
✅ .bolt/                   # Bolt.new файлы
```

### 2. **Файлы разработки (уже в .gitignore)**
```
✅ .env                     # Локальные переменные окружения
✅ .env.local               # Локальные переменные
✅ .env.example             # Пример переменных
✅ tsconfig.tsbuildinfo     # Кэш TypeScript
✅ next-env.d.ts           # Автогенерируемые типы
```

### 3. **Документация и отчеты (НЕ нужны на продакшене)**
```
❌ CHANGES.md               # Отчет о изменениях
❌ CITY_PAGES_README.md     # README для городских страниц
❌ IMPLEMENTATION_REPORT.md # Отчет о реализации
❌ SUMMARY.md               # Краткая сводка
❌ DEPLOYMENT.md            # Инструкция по деплою
❌ PERFORMANCE_OPTIMIZATION.md # Оптимизация производительности
❌ TELEGRAM_SETUP.md        # Настройка Telegram
❌ README.md                # Основной README
❌ docs/                    # Вся папка с документацией
```

### 4. **Тестовые и отладочные файлы**
```
❌ test-autocomplete-component.tsx  # Тестовый компонент
❌ scripts/                         # Скрипты для разработки
```

### 5. **Конфигурационные файлы разработки**
```
❌ .eslintrc.json           # Настройки линтера
❌ .prettierrc              # Настройки форматирования
❌ components.json           # Настройки shadcn/ui
❌ drizzle.config.ts        # Конфигурация Drizzle
❌ postcss.config.js         # Конфигурация PostCSS
❌ tailwind.config.ts        # Конфигурация Tailwind
❌ tsconfig.json            # Конфигурация TypeScript
❌ next.config.js            # Конфигурация Next.js
❌ package.json              # Зависимости (не нужны после сборки)
❌ package-lock.json         # Lock файл зависимостей
```

---

## ✅ Файлы, которые НУЖНО загрузить на хостинг

### 1. **Основные файлы приложения**
```
✅ app/                     # Все страницы Next.js
✅ components/              # Все компоненты
✅ lib/                     # Утилиты и библиотеки
✅ hooks/                   # React хуки
✅ public/                  # Статические файлы
✅ db/                      # Схема базы данных
✅ supabase/                # Миграции Supabase
```

### 2. **Собранные файлы (после `npm run build`)**
```
✅ .next/                   # Собранное приложение
✅ out/                     # Статический экспорт (если используется)
```

### 3. **Переменные окружения (только продакшен)**
```
✅ .env.production          # Продакшен переменные
```

---

## 🚀 Рекомендуемый процесс деплоя

### 1. **Подготовка к деплою**

```bash
# 1. Убедитесь, что все изменения закоммичены
git add .
git commit -m "Готово к деплою"

# 2. Соберите проект
npm run build

# 3. Проверьте, что сборка прошла успешно
npm start
```

### 2. **Создание .deployignore файла**

Создайте файл `.deployignore` в корне проекта:

```
# Документация
CHANGES.md
CITY_PAGES_README.md
IMPLEMENTATION_REPORT.md
SUMMARY.md
DEPLOYMENT.md
PERFORMANCE_OPTIMIZATION.md
TELEGRAM_SETUP.md
README.md
docs/

# Тестовые файлы
test-autocomplete-component.tsx
scripts/

# Конфигурация разработки
.eslintrc.json
.prettierrc
components.json
drizzle.config.ts
postcss.config.js
tailwind.config.ts
tsconfig.json
next.config.js
package.json
package-lock.json

# Системные файлы
.git/
.vscode/
.idea/
.bolt/
node_modules/
.next/
.env
.env.local
.env.example
tsconfig.tsbuildinfo
next-env.d.ts
```

### 3. **Загрузка на Reg.ru**

**Вариант 1: Через Git (рекомендуется)**
```bash
# На хостинге выполните:
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
npm run build
npm start
```

**Вариант 2: Ручная загрузка**
1. Создайте архив только нужных файлов
2. Загрузите на хостинг
3. Распакуйте
4. Выполните `npm install && npm run build && npm start`

---

## ⚠️ Важные моменты для Reg.ru

### 1. **Node.js версия**
Убедитесь, что на хостинге установлена Node.js версии 18+ (рекомендуется 20+)

### 2. **Переменные окружения**
Создайте файл `.env` на хостинге с продакшен настройками:
```env
DATABASE_URL=your_production_database_url
NEXT_PUBLIC_SITE_URL=https://your-domain.com
# Другие переменные...
```

### 3. **База данных**
Убедитесь, что база данных настроена и миграции применены

### 4. **Домен и SSL**
Настройте домен и SSL сертификат в панели Reg.ru

---

## 📋 Финальный чек-лист

Перед загрузкой на хостинг убедитесь:

- [ ] Проект собирается без ошибок (`npm run build`)
- [ ] Все тесты проходят (если есть)
- [ ] Переменные окружения настроены для продакшена
- [ ] База данных готова к работе
- [ ] Домен настроен
- [ ] SSL сертификат установлен
- [ ] Создан .deployignore файл
- [ ] Готовы к загрузке только нужные файлы

---

## 🎯 Итоговый список файлов для загрузки

**Обязательно загрузить:**
- `app/` - все страницы
- `components/` - все компоненты  
- `lib/` - утилиты
- `hooks/` - React хуки
- `public/` - статические файлы
- `db/` - схема БД
- `supabase/` - миграции
- `.next/` - собранное приложение
- `.env` - переменные окружения

**НЕ загружать:**
- Вся документация (`docs/`, `*.md`)
- Конфигурация разработки (`*.config.*`, `package.json`)
- Системные файлы (`.git/`, `node_modules/`)
- Тестовые файлы

---

**Готово к деплою! 🚀**
