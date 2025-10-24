/**
 * Скрипт для тестирования IndexNow API
 * Запуск: node scripts/test-indexnow.js
 */

const INDEXNOW_KEY = '5KTGsAzSgRxtoPKGw5EPQ5R9nlLWPrLk';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://salutgrad.ru';

async function testIndexNow() {
  console.log('🔍 Тестирование IndexNow API...\n');

  // Тест 1: Проверка файла с ключом
  console.log('1️⃣ Проверка файла с ключом:');
  try {
    const keyFileUrl = `${BASE_URL}/${INDEXNOW_KEY}.txt`;
    const response = await fetch(keyFileUrl);
    
    if (response.ok) {
      const keyContent = await response.text();
      if (keyContent.trim() === INDEXNOW_KEY) {
        console.log('✅ Файл с ключом найден и корректен');
        console.log(`   URL: ${keyFileUrl}`);
        console.log(`   Ключ: ${keyContent.trim()}`);
      } else {
        console.log('❌ Содержимое файла не соответствует ключу');
      }
    } else {
      console.log(`❌ Файл с ключом не найден (${response.status})`);
    }
  } catch (error) {
    console.log(`❌ Ошибка при проверке файла: ${error.message}`);
  }

  console.log('\n2️⃣ Тестирование отправки URL:');

  // Тест 2: Отправка одного URL
  try {
    const testUrl = `${BASE_URL}/`;
    const params = new URLSearchParams({
      url: testUrl,
      key: INDEXNOW_KEY,
      host: new URL(BASE_URL).host
    });

    const response = await fetch(`https://yandex.com/indexnow?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`📤 Отправка URL: ${testUrl}`);
    console.log(`📊 Статус ответа: ${response.status}`);
    
    if (response.status === 202) {
      console.log('✅ URL успешно отправлен в Яндекс');
    } else {
      console.log(`❌ Ошибка отправки: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Ошибка при отправке: ${error.message}`);
  }

  // Тест 3: Отправка нескольких URL
  try {
    const testUrls = [
      `${BASE_URL}/`,
      `${BASE_URL}/catalog`,
      `${BASE_URL}/about`
    ];

    const response = await fetch('https://yandex.com/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        host: new URL(BASE_URL).host,
        key: INDEXNOW_KEY,
        urlList: testUrls
      }),
    });

    console.log(`\n📤 Отправка ${testUrls.length} URL:`);
    testUrls.forEach(url => console.log(`   - ${url}`));
    console.log(`📊 Статус ответа: ${response.status}`);
    
    if (response.status === 202) {
      console.log('✅ URL успешно отправлены в Яндекс');
    } else {
      console.log(`❌ Ошибка отправки: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log(`❌ Ошибка при отправке: ${error.message}`);
  }

  console.log('\n3️⃣ Тестирование через API endpoint:');

  // Тест 4: Через наш API endpoint
  try {
    const apiUrl = `${BASE_URL}/api/indexnow?url=${encodeURIComponent(BASE_URL)}`;
    const response = await fetch(apiUrl);
    const result = await response.json();

    console.log(`📤 API запрос: ${apiUrl}`);
    console.log(`📊 Результат:`, result);
  } catch (error) {
    console.log(`❌ Ошибка API: ${error.message}`);
  }

  console.log('\n🎯 Рекомендации:');
  console.log('1. Убедитесь, что файл с ключом доступен по URL');
  console.log('2. Проверьте, что ваш сайт доступен из интернета');
  console.log('3. Статус 202 означает успешную отправку');
  console.log('4. Яндекс может занять время для обработки запросов');
}

// Запуск теста
testIndexNow().catch(console.error);

