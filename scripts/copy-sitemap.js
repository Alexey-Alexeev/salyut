/**
 * Скрипт для копирования детального sitemap.xml из public в out
 * После сборки Next.js генерирует свой упрощенный sitemap.xml,
 * но нам нужен детальный с video и image разметкой
 */

const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'public', 'sitemap.xml');
const destPath = path.join(__dirname, '..', 'out', 'sitemap.xml');

try {
  // Проверяем существование исходного файла
  if (!fs.existsSync(sourcePath)) {
    console.error('❌ Файл public/sitemap.xml не найден');
    process.exit(1);
  }

  // Проверяем существование директории out
  const outDir = path.dirname(destPath);
  if (!fs.existsSync(outDir)) {
    console.error('❌ Директория out/ не найдена. Убедитесь, что сборка завершена');
    process.exit(1);
  }

  // Копируем файл
  fs.copyFileSync(sourcePath, destPath);
  console.log('✅ Sitemap успешно скопирован из public/sitemap.xml в out/sitemap.xml');
  
  // Выводим информацию о размере файла
  const stats = fs.statSync(destPath);
  console.log(`   Размер файла: ${(stats.size / 1024).toFixed(2)} KB`);
  
} catch (error) {
  console.error('❌ Ошибка при копировании sitemap:', error.message);
  process.exit(1);
}

