/**
 * Тестовый скрипт для проверки корректности данных городов
 * 
 * Запуск: node scripts/test-cities.js
 */

// Импортируем данные о городах
const { cities, getCityBySlug, getAllCitySlugs, isCitySlugValid } = require('../lib/cities.ts');

console.log('🧪 Тестирование данных городов...\n');

// Тест 1: Проверка количества городов
console.log(`✅ Тест 1: Всего городов: ${cities.length}`);

// Тест 2: Проверка уникальности slug
const slugs = cities.map(c => c.slug);
const uniqueSlugs = new Set(slugs);
if (slugs.length === uniqueSlugs.size) {
    console.log('✅ Тест 2: Все slug уникальны');
} else {
    console.log('❌ Тест 2: ОШИБКА - есть дублирующиеся slug!');
    const duplicates = slugs.filter((item, index) => slugs.indexOf(item) !== index);
    console.log('   Дубликаты:', duplicates);
}

// Тест 3: Проверка обязательных полей
console.log('\n📋 Тест 3: Проверка обязательных полей');
let hasErrors = false;
cities.forEach(city => {
    const required = ['slug', 'name', 'nameLocative', 'nameAccusative', 'region', 'metaDescription'];
    const missing = required.filter(field => !city[field]);

    if (missing.length > 0) {
        console.log(`❌ ${city.name || city.slug}: отсутствуют поля - ${missing.join(', ')}`);
        hasErrors = true;
    }
});
if (!hasErrors) {
    console.log('✅ Все города имеют обязательные поля');
}

// Тест 4: Проверка корректности склонений
console.log('\n📝 Тест 4: Примеры склонений');
const testCities = ['moskva', 'balashiha', 'lyubertsy'];
testCities.forEach(slug => {
    const city = getCityBySlug(slug);
    if (city) {
        console.log(`✅ ${city.name}:`);
        console.log(`   - в ${city.nameLocative}`);
        console.log(`   - в ${city.nameAccusative}`);
    }
});

// Тест 5: Проверка функции isCitySlugValid
console.log('\n🔍 Тест 5: Проверка валидации slug');
console.log(`✅ 'moskva' валиден: ${isCitySlugValid('moskva')}`);
console.log(`✅ 'invalid-city' не валиден: ${!isCitySlugValid('invalid-city')}`);

// Тест 6: Вывод всех URL для проверки
console.log('\n🌐 Тест 6: Список всех URL городских страниц:');
console.log('-------------------------------------------');
getAllCitySlugs().forEach(slug => {
    const city = getCityBySlug(slug);
    console.log(`/${slug.padEnd(20)} → ${city.name}`);
});

// Тест 7: Проверка длины metaDescription
console.log('\n📏 Тест 7: Проверка длины metaDescription (оптимально 120-160 символов)');
cities.forEach(city => {
    const len = city.metaDescription.length;
    if (len < 120) {
        console.log(`⚠️  ${city.name}: слишком короткое описание (${len} символов)`);
    } else if (len > 160) {
        console.log(`⚠️  ${city.name}: слишком длинное описание (${len} символов)`);
    }
});

// Тест 8: Проверка приоритетности по населению
console.log('\n👥 Тест 8: Топ-5 городов по населению (для приоритизации рекламы):');
const sortedByPopulation = [...cities]
    .filter(c => c.population)
    .sort((a, b) => b.population - a.population)
    .slice(0, 5);

sortedByPopulation.forEach((city, index) => {
    console.log(`${index + 1}. ${city.name.padEnd(20)} - ${city.population.toLocaleString('ru-RU')} человек`);
});

console.log('\n✨ Тестирование завершено!\n');
console.log('💡 Рекомендации:');
console.log('   1. Проверьте корректность склонений на странице');
console.log('   2. Начните рекламу с топ-5 городов по населению');
console.log('   3. Для каждого города создайте отдельную кампанию в Яндекс Директ');
console.log('   4. Используйте URL: https://salutgrad.ru/{slug}\n');


