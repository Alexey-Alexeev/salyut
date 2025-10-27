#!/usr/bin/env node

/**
 * Скрипт для отправки URL в Яндекс для быстрой индексации
 * Использует IndexNow API от Яндекса
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Конфигурация
const SITE_URL = 'https://salutgrad.ru';
const YANDEX_KEY = process.env.YANDEX_INDEXNOW_KEY || '5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk';

// Функция для получения ключа из файла на сайте
async function getKeyFromSite() {
  try {
    const https = require('https');
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'salutgrad.ru',
        port: 443,
        path: '/5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk.txt',
        method: 'GET'
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const key = data.trim();
          if (key && key.length > 0) {
            resolve(key);
          } else {
            reject(new Error('Ключ не найден в файле'));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  } catch (error) {
    throw new Error('Не удалось получить ключ: ' + error.message);
  }
}

// Функция для отправки URL в Яндекс IndexNow
async function submitToYandex(urls, key) {
  let options, data;
  
  if (urls.length === 1) {
    // Для одного URL используем GET
    const urlString = urls[0];
    options = {
      hostname: 'yandex.com',
      port: 443,
      path: `/indexnow?key=${key}&host=${SITE_URL}&url=${encodeURIComponent(urlString)}`,
      method: 'GET'
    };
    data = null;
  } else {
    // Для нескольких URL используем POST с JSON телом
    // Ключ должен быть в теле запроса, а не в URL!
    const requestBody = {
      key: key,
      host: SITE_URL,
      urlList: urls
    };
    data = JSON.stringify(requestBody);
    options = {
      hostname: 'yandex.com',
      port: 443,
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`Status: ${res.statusCode}`);
      console.log(`Headers: ${JSON.stringify(res.headers)}`);
      
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        console.log('Response:', responseData);
        resolve({ status: res.statusCode, data: responseData });
      });
    });

    req.on('error', (error) => {
      console.error('Error:', error);
      reject(error);
    });

    if (data) {
      req.write(data); // Отправляем JSON только для POST
    }
    req.end();
  });
}

// Функция для извлечения URL из sitemap.xml
function extractUrlsFromSitemap() {
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  
  const urlRegex = /<loc>(https:\/\/salutgrad\.ru\/[^<]+)<\/loc>/g;
  const urls = [];
  let match;
  
  while ((match = urlRegex.exec(sitemapContent)) !== null) {
    const url = match[1];
    // Фильтруем только страницы продуктов и главную страницу
    if (url.includes('/product/') || url === 'https://salutgrad.ru/') {
      urls.push(url);
    }
  }
  
  return urls;
}

// Основная функция
async function main() {
  console.log('🚀 Отправка URL в Яндекс для быстрой индексации...\n');
  
  try {
    // Получаем ключ
    let key = YANDEX_KEY;
    if (key === '5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk') {
      console.log('🔑 Получаем ключ IndexNow с сайта...');
      try {
        key = await getKeyFromSite();
      } catch (error) {
        console.log('⚠️  Не удалось получить ключ с сайта, используем локальный');
        key = '5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk';
      }
    }
    
    if (!key) {
      console.log('❌ Ключ IndexNow не найден!');
      return;
    }
    
    console.log('✅ Ключ IndexNow получен');
    // Извлекаем URL из sitemap (только страницы продуктов)
    const urls = extractUrlsFromSitemap();
    console.log(`📋 Найдено ${urls.length} URL страниц продуктов в sitemap.xml`);
    
    // Показываем первые 10 URL для проверки
    console.log('\n📄 Первые 10 URL:');
    urls.slice(0, 10).forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });
    
    if (urls.length > 10) {
      console.log(`... и еще ${urls.length - 10} URL`);
    }
    
    // Отправляем в Яндекс (только страницы продуктов)
    const batchSize = 50; // Небольшие батчи для надежности
    const batches = [];
    
    for (let i = 0; i < urls.length; i += batchSize) {
      batches.push(urls.slice(i, i + batchSize));
    }
    
    console.log(`\n📦 Отправляем ${batches.length} батчей...`);
    
    for (let i = 0; i < batches.length; i++) {
      const method = batches[i].length === 1 ? 'GET' : 'POST';
      console.log(`\n🔄 Отправка батча ${i + 1}/${batches.length} (${batches[i].length} URL, метод: ${method})...`);
      
      const result = await submitToYandex(batches[i], key);
      
      if (result.status === 200) {
        console.log(`✅ Батч ${i + 1} успешно отправлен`);
      } else {
        console.log(`❌ Ошибка в батче ${i + 1}: ${result.status}`);
      }
      
      // Пауза между батчами
      if (i < batches.length - 1) {
        console.log('⏳ Пауза 2 секунды...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 Отправка завершена!');
    console.log('\n📝 Что дальше:');
    console.log('1. Проверьте статус в Яндекс.Вебмастере');
    console.log('2. Обычно индексация происходит в течение 24-48 часов');
    console.log('3. Для проверки используйте: site:salutgrad.ru');
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = { submitToYandex, extractUrlsFromSitemap };
