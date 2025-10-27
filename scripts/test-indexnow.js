#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки IndexNow API с одним URL
 */

const https = require('https');

const SITE_URL = 'https://salutgrad.ru';
const KEY = '5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk';
const TEST_URL = 'https://salutgrad.ru/';

console.log('🧪 Тестируем IndexNow API с одним URL...\n');

// Тест 1: GET запрос с одним URL
function testSingleUrl() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'yandex.com',
      port: 443,
      path: `/indexnow?key=${KEY}&host=${SITE_URL}&url=${encodeURIComponent(TEST_URL)}`,
      method: 'GET'
    };

    console.log('📤 Отправляем GET запрос:');
    console.log(`URL: https://yandex.com${options.path}`);

    const req = https.request(options, (res) => {
      console.log(`\n📥 Ответ:`);
      console.log(`Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response: ${responseData || '(пустой ответ)'}`);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Ошибка:', error);
      reject(error);
    });

    req.end();
  });
}

// Тест 3: POST запрос с одним URL (как в основном скрипте)
function testPostSingleUrlLikeMain() {
  return new Promise((resolve, reject) => {
    const requestBody = {
      key: KEY,
      host: SITE_URL,
      urlList: [TEST_URL]
    };
    const data = JSON.stringify(requestBody);
    
    const options = {
      hostname: 'yandex.com',
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    console.log('\n📤 Отправляем POST запрос (как в основном скрипте):');
    console.log(`URL: https://yandex.com${options.path}`);
    console.log(`Body: ${data}`);

    const req = https.request(options, (res) => {
      console.log(`\n📥 Ответ:`);
      console.log(`Status: ${res.statusCode}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log(`Response: ${responseData || '(пустой ответ)'}`);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('❌ Ошибка:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Запуск тестов
async function runTests() {
  try {
    console.log('🔑 Ключ:', KEY);
    console.log('🌐 Сайт:', SITE_URL);
    console.log('📄 Тестовый URL:', TEST_URL);
    
    console.log('\n' + '='.repeat(50));
    console.log('ТЕСТ 1: GET запрос с одним URL');
    console.log('='.repeat(50));
    
    const result1 = await testSingleUrl();
    
    console.log('\n' + '='.repeat(50));
    console.log('ТЕСТ 2: POST запрос с одним URL (как в основном скрипте)');
    console.log('='.repeat(50));
    
    const result2 = await testPostSingleUrlLikeMain();
    
    console.log('\n' + '='.repeat(50));
    console.log('РЕЗУЛЬТАТЫ:');
    console.log('='.repeat(50));
    console.log(`GET запрос: ${result1.status === 202 ? '✅ Успех' : '❌ Ошибка'} (${result1.status})`);
    console.log(`POST запрос: ${result2.status === 202 ? '✅ Успех' : '❌ Ошибка'} (${result2.status})`);
    
    if (result1.status === 202 || result2.status === 202) {
      console.log('\n🎉 Ключ работает! Проблема в основном скрипте.');
    } else {
      console.log('\n⚠️  Ключ не работает. Нужно зарегистрировать в Яндекс.Вебмастере.');
    }
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

runTests();