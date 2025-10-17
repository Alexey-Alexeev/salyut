# 🔥 HOTFIX: Исправление ошибки 403 для sitemap.xml на рег.ру

## Проблема
При обращении к https://salutgrad.ru/sitemap.xml на рег.ру выдавалась ошибка **403 Forbidden**.  
На Vercel всё работало корректно.

## Причина
В файле `public/.htaccess` было правило, блокирующее **все .xml файлы**:

```apache
<FilesMatch "(\.(env|git|htaccess|xml|json|lock|config|log|sh|sql))$">
    Order allow,deny
    Deny from all
</FilesMatch>
```

## Исправление

### 1. Обновлен `public/.htaccess`
Добавлено исключение для `sitemap.xml` и `robots.txt`:

```apache
# Разрешаем доступ к важным SEO-файлам
<FilesMatch "^(sitemap\.xml|robots\.txt)$">
    Require all granted
</FilesMatch>

# Запрещаем доступ к системным файлам
<FilesMatch "(\.(env|git|htaccess|json|lock|config|log|sh|sql))$">
    Require all denied
</FilesMatch>
```

### 2. Обновлен `scripts/copy-sitemap.js`
Теперь скрипт копирует не только `sitemap.xml`, но и `.htaccess`:

```javascript
const filesToCopy = [
  { name: 'sitemap.xml', ... },
  { name: '.htaccess', ... }
];
```

### 3. Build автоматически копирует файлы
```bash
npm run build
# → next build && node scripts/copy-sitemap.js
```

## Деплой

### Что делать сейчас:

1. **Пересоберите проект:**
   ```bash
   npm run build
   ```

2. **Проверьте локально:**
   ```bash
   # Должны быть оба файла:
   ls -la out/.htaccess    # ~3 KB
   ls -la out/sitemap.xml  # ~56 KB
   ```

3. **Загрузите на рег.ру:**
   - Включите показ скрытых файлов в FTP-клиенте!
   - Загрузите ВСЁ содержимое `out/` на сервер
   - Убедитесь, что `.htaccess` загрузился

4. **Проверьте результат:**
   - ✅ https://salutgrad.ru/sitemap.xml — должен открываться
   - ✅ Размер ~56 KB
   - ✅ Содержит `xmlns:image` и `xmlns:video`

## Статус
- ✅ Код исправлен
- ✅ Скрипт обновлен
- ✅ Документация создана
- ⏳ **Требуется деплой на рег.ру**

## Документация
- `SITEMAP_FIX.md` — детальное описание проблемы и решения
- `DEPLOY_TO_REGRU.md` — полная инструкция по деплою

