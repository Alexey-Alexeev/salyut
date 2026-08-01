/**
 * Шаг 3: скачивает все фото из Supabase Storage по ссылкам из выгрузки.
 * Собирает URL вида .../storage/v1/object/public/<bucket>/<file> из JSON-таблиц
 * и сохраняет в regru/uploads/<bucket>/<file> с сохранением структуры.
 * Запуск: npx tsx scripts/download-photos.ts
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';

const EXPORT_DIR = join(process.cwd(), 'regru', 'export');
const OUT_DIR = join(process.cwd(), 'regru', 'uploads');

const MARKER = '/storage/v1/object/public/';

// Собираем все строковые значения из объекта рекурсивно
function collectStrings(val: any, acc: string[]) {
  if (typeof val === 'string') acc.push(val);
  else if (Array.isArray(val)) val.forEach((v) => collectStrings(v, acc));
  else if (val && typeof val === 'object') Object.values(val).forEach((v) => collectStrings(v, acc));
}

const files = ['products', 'categories', 'reviews', 'manufacturers'];
const urls = new Set<string>();

for (const f of files) {
  const p = join(EXPORT_DIR, `${f}.json`);
  if (!existsSync(p)) continue;
  const rows = JSON.parse(readFileSync(p, 'utf-8'));
  const strings: string[] = [];
  collectStrings(rows, strings);
  for (const s of strings) {
    if (s.includes(MARKER)) urls.add(s);
  }
}

console.log(`🔎 Найдено уникальных фото-ссылок на Supabase Storage: ${urls.size}\n`);

async function main() {
  let ok = 0;
  let fail = 0;
  const failed: string[] = [];

  for (const url of urls) {
    const rel = url.split(MARKER)[1]; // bucket/file
    const dest = join(OUT_DIR, rel);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, buf);
      ok++;
      console.log(`  ✅ ${rel}  (${(buf.length / 1024).toFixed(0)} КБ)`);
    } catch (e: any) {
      fail++;
      failed.push(`${rel} — ${e.message}`);
      console.log(`  ❌ ${rel} — ${e.message}`);
    }
  }

  console.log(`\n📦 Скачано: ${ok}, ошибок: ${fail}`);
  console.log(`   Папка: ${OUT_DIR}`);
  if (failed.length) {
    console.log('\n⚠️  Не скачались:');
    failed.forEach((f) => console.log('   - ' + f));
  }
}

main().catch((e) => {
  console.error('💥', e);
  process.exit(1);
});
