import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../db/schema'

// Берём строку подключения из окружения. Бросаем явную ошибку, если не задана.
const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Please configure it in .env or .env.local')
}

// Создаем клиент для миграций
// Для Supabase обычно требуется SSL. Разрешим принудительно включать его через переменные,
// но по умолчанию включим безопасные настройки для продакшена.
const commonOptions = {
  ssl: process.env.PGSSLMODE === 'disable' ? undefined : { rejectUnauthorized: false } as unknown as boolean,
}

const migrationClient = postgres(connectionString, { max: 1, ...commonOptions })

// Создаем клиент для запросов
const queryClient = postgres(connectionString, { ...commonOptions })

export const db = drizzle(queryClient, { schema })

// Экспортируем для миграций
export { migrationClient }
