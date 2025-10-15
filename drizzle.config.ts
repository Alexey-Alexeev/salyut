import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Загружаем переменные окружения из .env и .env.local (локальные перекрывают общие)
config({ path: '.env.local' });

export default defineConfig({
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Добавьте для лучшей диагностики
  verbose: true,
  strict: true,
});
