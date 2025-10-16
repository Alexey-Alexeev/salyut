#!/usr/bin/env node

/**
 * Скрипт для тестирования настроек деплоя
 * Проверяет наличие всех необходимых переменных окружения
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'NEXT_PUBLIC_YANDEX_API_KEY'
];

// Проверка на опасные переменные
const dangerousVars = [
  'NEXT_PUBLIC_TELEGRAM_BOT_TOKEN',
  'NEXT_PUBLIC_TELEGRAM_CHAT_ID'
];

const requiredSecrets = [
  'FTP_SERVER',
  'FTP_USERNAME',
  'FTP_PASSWORD',
  'FTP_SERVER_DIR'
];

console.log('🔍 Проверка настроек деплоя...\n');

// Проверка переменных окружения
console.log('📋 Переменные окружения:');
let envVarsOk = true;

requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ ${varName}: НЕ НАЙДЕНА`);
    envVarsOk = false;
  }
});

console.log('\n🔐 GitHub Secrets (проверьте в настройках репозитория):');
requiredSecrets.forEach(secretName => {
  console.log(`  📝 ${secretName}: [должен быть настроен в GitHub Secrets]`);
});

// Проверка на опасные переменные
console.log('\n🚨 Проверка безопасности:');
let hasDangerousVars = false;

dangerousVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`  ❌ ${varName}: ОПАСНО! Эта переменная попадет в браузер!`);
    hasDangerousVars = true;
  } else {
    console.log(`  ✅ ${varName}: не найдена (хорошо)`);
  }
});

if (hasDangerousVars) {
  console.log('\n⚠️  ВНИМАНИЕ: Найдены опасные переменные!');
  console.log('   Используйте TELEGRAM_BOT_TOKEN вместо NEXT_PUBLIC_TELEGRAM_BOT_TOKEN');
  console.log('   Используйте TELEGRAM_CHAT_ID вместо NEXT_PUBLIC_TELEGRAM_CHAT_ID');
}

// Проверка структуры проекта
console.log('\n📁 Структура проекта:');
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'package.json',
  'next.config.js',
  'app/layout.tsx',
  'app/page.tsx',
  '.github/workflows/deploy.yml'
];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file}: НЕ НАЙДЕН`);
  }
});

// Проверка package.json
console.log('\n📦 Проверка package.json:');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('  ✅ build script найден');
  } else {
    console.log('  ❌ build script не найден');
  }
  
  if (packageJson.dependencies && packageJson.dependencies.next) {
    console.log(`  ✅ Next.js версия: ${packageJson.dependencies.next}`);
  } else {
    console.log('  ❌ Next.js не найден в зависимостях');
  }
} catch (error) {
  console.log('  ❌ Ошибка чтения package.json:', error.message);
}

// Итоговый результат
console.log('\n🎯 Результат проверки:');

if (envVarsOk) {
  console.log('✅ Все переменные окружения настроены');
  console.log('✅ Проект готов к деплою');
  console.log('\n🚀 Следующие шаги:');
  console.log('  1. Настройте GitHub Secrets');
  console.log('  2. Сделайте push в master ветку');
  console.log('  3. Проверьте GitHub Actions');
  console.log('  4. Убедитесь, что сайт доступен');
} else {
  console.log('❌ Некоторые переменные не настроены');
  console.log('\n🔧 Что нужно сделать:');
  console.log('  1. Настройте переменные окружения');
  console.log('  2. Создайте .env.local файл');
  console.log('  3. Добавьте GitHub Secrets');
  console.log('  4. Повторите проверку');
}

console.log('\n📚 Документация:');
console.log('  - CI_CD_SETUP.md - настройка CI/CD');
console.log('  - ENV_VARIABLES_SETUP.md - настройка переменных');
console.log('  - DOMAIN_CHANGE_INSTRUCTIONS.md - смена домена');

console.log('\n✨ Проверка завершена!\n');
