#!/usr/bin/env node

/**
 * Альтернативный скрипт - отправка каждого URL через GET запрос
 * (если POST не работает)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://salutgrad.ru';
const KEY = '5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk';

// Функция для отправки одного URL через GET
function submitSingleUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'yandex.com',
      port: 443,
      path: `/indexnow?key=${KEY}&host=${SITE_URL}&url=${encodeURIComponent(url)}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({ status: res.statusCode, data: responseData, url });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

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
  console.log('🚀 Отправка URL в Яндекс через GET запросы...\n');
  
  try {
    const urls = extractUrlsFromSitemap();
    console.log(`📋 Найдено ${urls.length} URL страниц продуктов`);
    
    let successCount = 0;
    let errorCount = 0;
    
    console.log('\n📦 Отправляем каждый URL отдельно...\n');
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`🔄 ${i + 1}/${urls.length}: ${url}`);
      
      try {
        const result = await submitSingleUrl(url);
        
        if (result.status === 202 || result.status === 200) {
          console.log(`✅ Успех (${result.status})`);
          successCount++;
        } else {
          console.log(`❌ Ошибка (${result.status}): ${result.data}`);
          errorCount++;
        }
        
        // Пауза между запросами
        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100)); // 100ms пауза
        }
        
      } catch (error) {
        console.log(`❌ Ошибка: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('РЕЗУЛЬТАТЫ:');
    console.log('='.repeat(50));
    console.log(`✅ Успешно: ${successCount}`);
    console.log(`❌ Ошибок: ${errorCount}`);
    console.log(`📊 Всего: ${urls.length}`);
    
    if (successCount > 0) {
      console.log('\n🎉 Отправка завершена! Яндекс начнет индексацию.');
    } else {
      console.log('\n⚠️  Все запросы завершились ошибкой. Проверьте ключ.');
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  }
}

main();
