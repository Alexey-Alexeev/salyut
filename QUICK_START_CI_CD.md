# 🚀 Быстрый старт CI/CD

## ⚡ За 5 минут настроить автоматический деплой

### 1. **Настройте GitHub Secrets** (2 минуты)
В настройках репозитория GitHub:
```
Settings → Secrets and variables → Actions → New repository secret
```

**Добавьте:**
```
FTP_SERVER=ftp.your-domain.ru
FTP_USERNAME=your-ftp-username  
FTP_PASSWORD=your-ftp-password
FTP_SERVER_DIR=/public_html
```

### 2. **Проверьте настройки** (1 минута)
```bash
cd salyut
npm run test:deploy
```

### 3. **Сделайте push** (1 минута)
```bash
git add .
git commit -m "feat: setup CI/CD"
git push origin master
```

### 4. **Проверьте деплой** (1 минута)
- GitHub → Actions → Deploy to REG.RU
- Дождитесь зеленого ✅
- Откройте https://salutgrad.ru

## 🎯 Готово!

Теперь при каждом пуше в `master`:
1. ✅ Автоматически собирается проект
2. ✅ Загружается на хостинг РЕГ.РУ  
3. ✅ Сайт обновляется

## 🔧 Если что-то не работает

### **Ошибка FTP:**
- Проверьте данные в панели РЕГ.РУ
- Убедитесь в правильности пароля

### **Ошибка сборки:**
- Проверьте переменные окружения
- Убедитесь, что все секреты настроены

### **Сайт не обновляется:**
- Проверьте права FTP пользователя
- Убедитесь, что директория `/public_html` доступна

## 📚 Подробная документация

- `CI_CD_SETUP.md` - полная настройка
- `ENV_VARIABLES_SETUP.md` - переменные окружения
- `DOMAIN_CHANGE_INSTRUCTIONS.md` - смена домена

---
**Время настройки:** 5 минут  
**Результат:** Автоматический деплой при каждом пуше! 🎉
