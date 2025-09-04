// test-connection.js
const { Pool } = require('pg');

// Загружаем переменные окружения из .env.local
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

console.log('Проверяем подключение к:', connectionString);

if (!connectionString) {
  console.error('❌ DATABASE_URL не найден в переменных окружения');
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // Важно для Supabase
  },
});

async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Подключение к Supabase успешно!');

    const result = await client.query('SELECT version()');
    console.log('Версия PostgreSQL:', result.rows[0].version);

    // Проверим существующие схемы
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT LIKE 'pg_%' 
      AND schema_name != 'information_schema'
    `);

    console.log(
      'Существующие схемы:',
      schemas.rows.map(r => r.schema_name)
    );

    client.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка подключения:');
    console.error('Сообщение:', error.message);
    console.error('Код ошибки:', error.code);
    console.error('Детали:', error);

    if (client) {
      client.release();
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
