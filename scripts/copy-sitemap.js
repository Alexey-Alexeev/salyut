/**
 * Скрипт для копирования необходимых файлов из public в out после сборки
 * 
 * Копирует:
 * 1. sitemap.xml - детальный sitemap с video и image разметкой
 *    (вместо автогенерированного упрощенного от Next.js)
 * 2. .htaccess - правила для Apache (рег.ру хостинг)
 */

const fs = require('fs');
const path = require('path');

const filesToCopy = [
  {
    name: 'sitemap.xml',
    source: path.join(__dirname, '..', 'public', 'sitemap.xml'),
    dest: path.join(__dirname, '..', 'out', 'sitemap.xml'),
    required: true
  },
  {
    name: '.htaccess',
    source: path.join(__dirname, '..', 'public', '.htaccess'),
    dest: path.join(__dirname, '..', 'out', '.htaccess'),
    required: true
  },
  {
    name: 'yandex_085493d34d34fe0b.html',
    source: path.join(__dirname, '..', 'public', 'yandex_085493d34d34fe0b.html'),
    dest: path.join(__dirname, '..', 'out', 'yandex_085493d34d34fe0b.html'),
    required: true
  }
];

console.log('📦 Копирование файлов после сборки...\n');

let hasErrors = false;

filesToCopy.forEach(file => {
  try {
    // Проверяем существование исходного файла
    if (!fs.existsSync(file.source)) {
      if (file.required) {
        console.error(`❌ Файл ${file.name} не найден в public/`);
        hasErrors = true;
      } else {
        console.log(`⚠️  Файл ${file.name} не найден (необязательный)`);
      }
      return;
    }

    // Проверяем существование директории out
    const outDir = path.dirname(file.dest);
    if (!fs.existsSync(outDir)) {
      console.error('❌ Директория out/ не найдена. Убедитесь, что сборка завершена');
      hasErrors = true;
      return;
    }

    // Копируем файл
    fs.copyFileSync(file.source, file.dest);
    const stats = fs.statSync(file.dest);
    const size = stats.size > 1024 
      ? `${(stats.size / 1024).toFixed(2)} KB`
      : `${stats.size} bytes`;
    
    console.log(`✅ ${file.name} → out/ (${size})`);
    
  } catch (error) {
    console.error(`❌ Ошибка при копировании ${file.name}:`, error.message);
    hasErrors = true;
  }
});

if (hasErrors) {
  console.log('\n❌ Копирование завершено с ошибками');
  process.exit(1);
} else {
  console.log('\n✅ Все файлы успешно скопированы');
}

