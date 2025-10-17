#!/usr/bin/env node

/**
 * Скрипт для валидации JSON-LD разметки
 * Проверяет корректность структурированных данных
 */

const fs = require('fs');
const path = require('path');

// Функция для валидации JSON-LD
function validateJsonLd(jsonLd) {
  const errors = [];
  const warnings = [];

  try {
    // Проверяем базовую структуру
    if (!jsonLd['@context']) {
      errors.push('Отсутствует @context');
    }

    if (!jsonLd['@type']) {
      errors.push('Отсутствует @type');
    }

    // Проверяем обязательные поля для Product
    if (jsonLd['@type'] === 'Product' || (Array.isArray(jsonLd['@type']) && jsonLd['@type'].includes('Product'))) {
      if (!jsonLd.name) {
        errors.push('Product: отсутствует name');
      }
      
      if (!jsonLd.offers) {
        errors.push('Product: отсутствует offers (требуется Google Search Console)');
      } else {
        if (!jsonLd.offers.price) {
          errors.push('Product: offers отсутствует price');
        }
        if (!jsonLd.offers.priceCurrency) {
          errors.push('Product: offers отсутствует priceCurrency');
        }
      }

      // Проверяем наличие review или aggregateRating
      if (!jsonLd.review && !jsonLd.aggregateRating) {
        warnings.push('Product: рекомендуется добавить review или aggregateRating для Google Search Console');
      }
    }

    // Проверяем обязательные поля для Offer
    if (jsonLd['@type'] === 'Offer') {
      if (!jsonLd.price) {
        errors.push('Offer: отсутствует price');
      }
      if (!jsonLd.priceCurrency) {
        errors.push('Offer: отсутствует priceCurrency');
      }
    }

    // Проверяем обязательные поля для Review
    if (jsonLd['@type'] === 'Review') {
      if (!jsonLd.author) {
        errors.push('Review: отсутствует author');
      }
      if (!jsonLd.reviewRating) {
        errors.push('Review: отсутствует reviewRating');
      }
    }

    // Проверяем обязательные поля для AggregateRating
    if (jsonLd['@type'] === 'AggregateRating') {
      if (!jsonLd.ratingValue) {
        errors.push('AggregateRating: отсутствует ratingValue');
      }
      if (!jsonLd.reviewCount) {
        errors.push('AggregateRating: отсутствует reviewCount');
      }
    }

    return { errors, warnings, valid: errors.length === 0 };
  } catch (error) {
    return { 
      errors: [`Ошибка парсинга JSON: ${error.message}`], 
      warnings: [], 
      valid: false 
    };
  }
}

// Функция для извлечения JSON-LD из HTML
function extractJsonLdFromHtml(htmlContent) {
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gs;
  const matches = [];
  let match;

  while ((match = jsonLdRegex.exec(htmlContent)) !== null) {
    try {
      const jsonLd = JSON.parse(match[1]);
      matches.push(jsonLd);
    } catch (error) {
      console.error(`Ошибка парсинга JSON-LD: ${error.message}`);
    }
  }

  return matches;
}

// Основная функция валидации
function validateSchemaFiles() {
  console.log('🔍 Валидация JSON-LD разметки...\n');

  const filesToCheck = [
    'app/page.tsx',
    'app/product/[slug]/product-client.tsx',
    'app/catalog/catalog-client.tsx',
    'app/[city]/page.tsx'
  ];

  let totalErrors = 0;
  let totalWarnings = 0;

  filesToCheck.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Файл не найден: ${filePath}`);
      return;
    }

    console.log(`📄 Проверка ${filePath}:`);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Ищем JSON-LD в коде
      const jsonLdMatches = content.match(/JSON\.stringify\([\s\S]*?\)/g);
      
      if (!jsonLdMatches || jsonLdMatches.length === 0) {
        console.log('   ❌ JSON-LD разметка не найдена');
        return;
      }

      let fileErrors = 0;
      let fileWarnings = 0;

      jsonLdMatches.forEach((match, index) => {
        try {
          // Извлекаем объект из JSON.stringify()
          const jsonStr = match.replace(/JSON\.stringify\(/, '').replace(/\)$/, '');
          const jsonLd = eval(`(${jsonStr})`); // Безопасно, так как это наш код
          
          const validation = validateJsonLd(jsonLd);
          
          if (validation.errors.length > 0) {
            console.log(`   ❌ JSON-LD #${index + 1}:`);
            validation.errors.forEach(error => {
              console.log(`      - ${error}`);
              fileErrors++;
            });
          }

          if (validation.warnings.length > 0) {
            console.log(`   ⚠️  JSON-LD #${index + 1}:`);
            validation.warnings.forEach(warning => {
              console.log(`      - ${warning}`);
              fileWarnings++;
            });
          }

          if (validation.valid && validation.warnings.length === 0) {
            console.log(`   ✅ JSON-LD #${index + 1}: Корректно`);
          }
        } catch (error) {
          console.log(`   ❌ Ошибка парсинга JSON-LD #${index + 1}: ${error.message}`);
          fileErrors++;
        }
      });

      totalErrors += fileErrors;
      totalWarnings += fileWarnings;

      if (fileErrors === 0 && fileWarnings === 0) {
        console.log('   ✅ Все JSON-LD разметки корректны');
      }

    } catch (error) {
      console.log(`   ❌ Ошибка чтения файла: ${error.message}`);
      totalErrors++;
    }

    console.log('');
  });

  // Итоговый отчет
  console.log('📊 Итоговый отчет:');
  console.log(`   Ошибки: ${totalErrors}`);
  console.log(`   Предупреждения: ${totalWarnings}`);
  
  if (totalErrors === 0) {
    console.log('   ✅ Все JSON-LD разметки прошли валидацию!');
    console.log('\n🎉 Google Search Console должен принять ваши структурированные данные.');
  } else {
    console.log('   ❌ Найдены ошибки в JSON-LD разметке');
    console.log('\n🔧 Исправьте ошибки и запустите валидацию снова.');
  }

  return totalErrors === 0;
}

// Запуск валидации
if (require.main === module) {
  const success = validateSchemaFiles();
  process.exit(success ? 0 : 1);
}

module.exports = { validateJsonLd, extractJsonLdFromHtml, validateSchemaFiles };
