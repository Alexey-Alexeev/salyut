/**
 * Шаг 1 миграции: выгрузка всех данных из Supabase (Postgres) в JSON-файлы.
 * Запуск:  npx tsx scripts/export-supabase.ts
 * Результат: папка regru/export/<таблица>.json + _summary.json со счётчиками строк.
 * Ничего не меняет в БД — только читает.
 */
import { config } from 'dotenv';
import postgres from 'postgres';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

config({ path: '.env.local' });
config({ path: '.env' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL не задан в .env.local');
  process.exit(1);
}

const OUT_DIR = join(process.cwd(), 'regru', 'export');

const PG_OPTS = {
  ssl: { rejectUnauthorized: false } as const,
  max: 1,
  idle_timeout: 10,
  connect_timeout: 15,
  prepare: false, // ОБЯЗАТЕЛЬНО для transaction pooler Supabase (порт 6543)
  fetch_types: false,
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Выполняет запрос на свежем соединении с повторами при обрыве. */
async function withRetry<T>(
  label: string,
  fn: (sql: ReturnType<typeof postgres>) => Promise<T>,
  attempts = 6
): Promise<T> {
  let lastErr: any;
  for (let i = 1; i <= attempts; i++) {
    const sql = postgres(connectionString!, PG_OPTS);
    try {
      const res = await fn(sql);
      await sql.end({ timeout: 5 });
      return res;
    } catch (e: any) {
      lastErr = e;
      try {
        await sql.end({ timeout: 5 });
      } catch {}
      if (i < attempts) {
        await sleep(400 * i); // небольшая пауза перед повтором
      }
    }
  }
  throw lastErr;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('🔌 Подключаюсь к Supabase...');

  // 1. Находим все пользовательские таблицы в схеме public
  const tables = await withRetry('list-tables', (sql) => sql<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);

  if (tables.length === 0) {
    console.log('⚠️  Не найдено ни одной таблицы в схеме public.');
    return;
  }

  // Можно указать конкретные таблицы аргументами:  npx tsx scripts/export-supabase.ts products
  const only = process.argv.slice(2);
  const targetTables = only.length
    ? tables.filter((t) => only.includes(t.table_name))
    : tables;

  console.log(
    `📋 Найдено таблиц: ${tables.length}` +
      (only.length ? ` (выгружаю только: ${only.join(', ')})` : '') +
      '\n'
  );

  const summary: Record<string, number> = {};

  for (const { table_name } of targetTables) {
    try {
      // Узнаём общее число строк
      const cnt = await withRetry(
        `count ${table_name}`,
        (sql) => sql<{ c: number }[]>`SELECT count(*)::int AS c FROM ${sql(table_name)}`
      );
      const total = cnt[0].c;

      // Тянем порциями по 50; если порция не проходит — дробим пополам до 1 строки.
      const fetchChunk = async (offset: number, limit: number): Promise<any[]> => {
        try {
          return await withRetry(
            `${table_name}@${offset}/${limit}`,
            (sql) => sql`SELECT * FROM ${sql(table_name)} ORDER BY id LIMIT ${limit} OFFSET ${offset}`
          );
        } catch (e: any) {
          if (limit <= 1) {
            console.log(`     ⚠️  строка offset=${offset} не выгрузилась (${e.message}) — пропущена`);
            return [];
          }
          const half = Math.ceil(limit / 2);
          const a = await fetchChunk(offset, half);
          const b = await fetchChunk(offset + half, limit - half);
          return [...a, ...b];
        }
      };

      const BATCH = 50;
      const rows: any[] = [];
      for (let offset = 0; offset < total; offset += BATCH) {
        const page = await fetchChunk(offset, Math.min(BATCH, total - offset));
        rows.push(...page);
      }
      const file = join(OUT_DIR, `${table_name}.json`);
      writeFileSync(file, JSON.stringify(rows, null, 2), 'utf-8');
      summary[table_name] = rows.length;
      console.log(`  ✅ ${table_name.padEnd(28)} ${rows.length} строк`);
    } catch (e: any) {
      summary[table_name] = -1;
      console.log(`  ❌ ${table_name.padEnd(28)} ошибка: ${e.message}`);
    }
  }

  writeFileSync(
    join(OUT_DIR, '_summary.json'),
    JSON.stringify(summary, null, 2),
    'utf-8'
  );

  console.log(`\n📦 Готово. Файлы сохранены в: ${OUT_DIR}`);
}

main().catch((e) => {
  console.error('💥 Ошибка выгрузки:', e);
  process.exit(1);
});
