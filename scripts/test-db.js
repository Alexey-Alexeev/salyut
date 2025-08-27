// scripts/test-db.js
/**
 * Скрипт для тестирования подключения к базе данных
 * Запуск: node scripts/test-db.js
 */

require('dotenv').config({ path: '.env.local' })

const { drizzle } = require('drizzle-orm/postgres-js')
const postgres = require('postgres')

async function testConnection() {
  console.log('🔍 Тестирование подключения к базе данных...\n')
  
  // Проверяем переменные окружения
  console.log('📋 Проверка переменных окружения:')
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Установлен' : '❌ Не найден')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Установлен' : '❌ Не найден')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Установлен' : '❌ Не найден')
  console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Установлен' : '❌ Не найден')
  console.log('TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID ? '✅ Установлен' : '❌ Не найден')
  
  if (!process.env.DATABASE_URL) {
    console.error('\n❌ DATABASE_URL не установлен!')
    console.log('\n💡 Добавьте в .env.local:')
    console.log('DATABASE_URL=postgresql://user:password@host:port/database')
    return
  }

  try {
    // Создаем подключение
    console.log('\n🔌 Подключаемся к базе данных...')
    const connectionString = process.env.DATABASE_URL
    const client = postgres(connectionString, {
      ssl: process.env.PGSSLMODE === 'disable' ? undefined : { rejectUnauthorized: false }
    })
    
    // Тестируем простой запрос
    const result = await client`SELECT version(), current_database(), current_user`
    console.log('✅ Подключение успешно!')
    console.log('📊 Версия PostgreSQL:', result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1])
    console.log('🗄️  База данных:', result[0].current_database)
    console.log('👤 Пользователь:', result[0].current_user)

    // Проверяем существование таблиц
    console.log('\n📋 Проверка таблиц:')
    const tables = await client`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `
    
    const expectedTables = ['categories', 'products', 'orders', 'order_items', 'reviews', 'profiles', 'manufacturers']
    
    for (const expectedTable of expectedTables) {
      const exists = tables.some(t => t.table_name === expectedTable)
      console.log(`  ${expectedTable}: ${exists ? '✅ Существует' : '❌ Отсутствует'}`)
    }

    // Проверяем содержимое таблицы orders
    console.log('\n📊 Проверка таблицы orders:')
    try {
      const ordersCount = await client`SELECT COUNT(*) as count FROM orders`
      console.log(`  Количество заказов: ${ordersCount[0].count}`)
      
      if (parseInt(ordersCount[0].count) > 0) {
        const recentOrders = await client`
          SELECT id, customer_name, created_at 
          FROM orders 
          ORDER BY created_at DESC 
          LIMIT 5
        `
        console.log('  Последние заказы:')
        recentOrders.forEach(order => {
          console.log(`    - ${order.id.slice(0, 8)}: ${order.customer_name} (${order.created_at})`)
        })
      }
    } catch (error) {
      console.error('  ❌ Ошибка при проверке таблицы orders:', error.message)
    }

    // Проверяем содержимое таблицы products
    console.log('\n📦 Проверка таблицы products:')
    try {
      const productsCount = await client`SELECT COUNT(*) as count FROM products`
      console.log(`  Количество товаров: ${productsCount[0].count}`)
    } catch (error) {
      console.error('  ❌ Ошибка при проверке таблицы products:', error.message)
    }

    await client.end()
    console.log('\n🎉 Тест завершен успешно!')

  } catch (error) {
    console.error('\n❌ Ошибка подключения:', error.message)
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Возможные причины:')
      console.log('  - Неверный хост в DATABASE_URL')
      console.log('  - Проблемы с интернет-соединением')
      console.log('  - Supabase проект приостановлен')
    }
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Проверьте:')
      console.log('  - Правильность пароля в DATABASE_URL')
      console.log('  - Активность проекта Supabase')
    }
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n💡 База данных не найдена:')
      console.log('  - Проверьте название базы в DATABASE_URL')
      console.log('  - Убедитесь, что Supabase проект создан')
    }
  }
}

testConnection().catch(console.error)