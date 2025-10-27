#!/usr/bin/env node

/**
 * Генератор ключа для IndexNow API
 * Создает случайный ключ длиной 32 символа
 */

const crypto = require('crypto');

function generateIndexNowKey() {
  return crypto.randomBytes(16).toString('hex');
}

const key = generateIndexNowKey();
console.log('🔑 Сгенерированный ключ IndexNow:');
console.log(key);
console.log('\n📝 Добавьте этот ключ в файл public/yandex-indexnow-key.txt:');
console.log(`YANDEX_INDEXNOW_KEY=${key}`);
console.log('\n⚠️  ВАЖНО: Этот ключ нужно также добавить в Яндекс.Вебмастер!');
