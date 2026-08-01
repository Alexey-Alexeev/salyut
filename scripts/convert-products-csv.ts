/**
 * Конвертирует выгруженный из Supabase products_1.csv (одна ячейка json_agg)
 * в regru/export/products.json — формат как у остальных таблиц.
 * Запуск: npx tsx scripts/convert-products-csv.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const dir = join(process.cwd(), 'regru', 'export');
const raw = readFileSync(join(dir, 'products_1.csv'), 'utf-8');

// 1. Убираем заголовок "data" (первая строка)
const nl = raw.indexOf('\n');
let cell = raw.slice(nl + 1).trim();

// 2. Снимаем внешние CSV-кавычки и разэкранируем удвоенные кавычки
if (cell.startsWith('"') && cell.endsWith('"')) {
  cell = cell.slice(1, -1);
}
cell = cell.replace(/""/g, '"');

// 3. Парсим и сохраняем
const rows = JSON.parse(cell);
if (!Array.isArray(rows)) throw new Error('Ожидался JSON-массив');

writeFileSync(join(dir, 'products.json'), JSON.stringify(rows, null, 2), 'utf-8');
console.log(`✅ products.json: ${rows.length} строк`);
console.log('   Пример полей:', Object.keys(rows[0] || {}).join(', '));
