#!/usr/bin/env node

/**
 * Простая проверка наличия обязательных элементов JSON-LD
 */

const fs = require('fs');
const path = require('path');

function checkSchemaStructure() {
  console.log('🔍 Проверка структуры JSON-LD разметки...\n');

  const filesToCheck = [
    { path: 'app/page.tsx', name: 'Главная страница' },
    { path: 'app/product/[slug]/product-client.tsx', name: 'Страница продукта' },
    { path: 'app/catalog/catalog-client.tsx', name: 'Каталог' },
    { path: 'app/[city]/page.tsx', name: 'Страницы городов' }
  ];

  let allGood = true;

  filesToCheck.forEach(({ path: filePath, name }) => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Файл не найден: ${filePath}`);
      return;
    }

    console.log(`📄 ${name}:`);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Проверяем наличие JSON-LD разметки
      const hasJsonLd = content.includes('application/ld+json');
      if (!hasJsonLd) {
        console.log('   ❌ JSON-LD разметка не найдена');
        allGood = false;
        return;
      }

      // Проверяем обязательные элементы для Google Search Console
      const checks = [
        { 
          pattern: /"@type":\s*"Product"/, 
          name: 'Product type',
          required: filePath.includes('product') || filePath.includes('catalog')
        },
        { 
          pattern: /"offers":\s*{/, 
          name: 'Offers',
          required: true
        },
        { 
          pattern: /"price":\s*product\.price/, 
          name: 'Price',
          required: true
        },
        { 
          pattern: /"priceCurrency":\s*"RUB"/, 
          name: 'Price Currency',
          required: true
        },
        { 
          pattern: /"priceValidUntil":\s*"2026-12-31"/, 
          name: 'Price Valid Until',
          required: true
        },
        { 
          pattern: /"aggregateRating":\s*{/, 
          name: 'Aggregate Rating',
          required: true
        },
        { 
          pattern: /"review":\s*\[/, 
          name: 'Reviews',
          required: true
        },
        { 
          pattern: /"reviewRating":\s*{/, 
          name: 'Review Rating',
          required: true
        }
      ];

      let fileGood = true;
      checks.forEach(check => {
        const found = check.pattern.test(content);
        if (check.required && !found) {
          console.log(`   ❌ Отсутствует: ${check.name}`);
          fileGood = false;
          allGood = false;
        } else if (found) {
          console.log(`   ✅ Найден: ${check.name}`);
        }
      });

      if (fileGood) {
        console.log('   ✅ Все обязательные элементы присутствуют');
      }

    } catch (error) {
      console.log(`   ❌ Ошибка чтения файла: ${error.message}`);
      allGood = false;
    }

    console.log('');
  });

  // Итоговый отчет
  console.log('📊 Итоговый отчет:');
  
  if (allGood) {
    console.log('   ✅ Все файлы содержат необходимые элементы JSON-LD');
    console.log('   ✅ Google Search Console должен принять структурированные данные');
    console.log('\n🎉 Проблема с предупреждениями Google Search Console должна быть решена!');
    console.log('\n📋 Что было добавлено:');
    console.log('   • offers - информация о ценах и наличии товаров');
    console.log('   • aggregateRating - общие рейтинги продуктов');
    console.log('   • review - отзывы клиентов');
    console.log('   • reviewRating - рейтинги в отзывах');
  } else {
    console.log('   ❌ Некоторые обязательные элементы отсутствуют');
    console.log('\n🔧 Проверьте файлы и убедитесь, что все элементы JSON-LD присутствуют.');
  }

  return allGood;
}

// Запуск проверки
if (require.main === module) {
  const success = checkSchemaStructure();
  process.exit(success ? 0 : 1);
}

module.exports = { checkSchemaStructure };
