/**
 * Скрипт для отправки всех товаров в Яндекс через IndexNow
 * Запуск: node scripts/submit-products-to-yandex.js
 */

const { submitProductUrl, submitMultipleUrls } = require('../lib/indexnow.ts');
const { db } = require('../lib/db.ts');
const { products } = require('../db/schema/index.ts');

async function submitAllProducts() {
  console.log('🚀 Отправка всех товаров в Яндекс через IndexNow...\n');

  try {
    // Получаем все активные товары
    const allProducts = await db.select({
      slug: products.slug,
      name: products.name
    }).from(products).where(eq(products.is_active, true));

    console.log(`📦 Найдено ${allProducts.length} активных товаров`);

    if (allProducts.length === 0) {
      console.log('❌ Товары не найдены');
      return;
    }

    // Отправляем все товары одним запросом
    const productUrls = allProducts.map(product => 
      `https://salutgrad.ru/product/${product.slug}`
    );

    console.log('📤 Отправляем товары в Яндекс...');
    const result = await submitMultipleUrls(productUrls);

    if (result.success) {
      console.log('✅ Все товары успешно отправлены в Яндекс!');
      console.log(`📊 Статус: ${result.status}`);
      console.log(`💬 Сообщение: ${result.message}`);
    } else {
      console.log('❌ Ошибка отправки товаров:');
      console.log(`📊 Статус: ${result.status}`);
      console.log(`💬 Сообщение: ${result.message}`);
    }

    // Показываем список отправленных товаров
    console.log('\n📋 Отправленные товары:');
    allProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.slug})`);
    });

  } catch (error) {
    console.error('❌ Ошибка при отправке товаров:', error);
  }
}

// Запуск скрипта
submitAllProducts();
