// scripts/setup-telegram.js
/**
 * Скрипт для настройки и диагностики Telegram бота
 * Запуск: node scripts/setup-telegram.js
 */

require('dotenv').config({ path: '.env.local' })

async function setupTelegram() {
  console.log('🤖 Настройка Telegram бота...\n')
  
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  
  console.log('📋 Проверка переменных окружения:')
  console.log('TELEGRAM_BOT_TOKEN:', botToken ? '✅ Установлен' : '❌ Не найден')
  console.log('TELEGRAM_CHAT_ID:', chatId ? '✅ Установлен' : '❌ Не найден')
  
  if (!botToken) {
    console.error('\n❌ TELEGRAM_BOT_TOKEN не найден!')
    console.log('\n💡 Получите токен бота:')
    console.log('1. Напишите @BotFather в Telegram')
    console.log('2. Отправьте команду /newbot')
    console.log('3. Следуйте инструкциям')
    console.log('4. Скопируйте токен в .env.local:')
    console.log('   TELEGRAM_BOT_TOKEN=your_bot_token_here')
    return
  }
  
  try {
    // Получаем информацию о боте
    console.log('\n🔍 Проверка бота...')
    const botInfo = await fetch(`https://api.telegram.org/bot${botToken}/getMe`)
    const botData = await botInfo.json()
    
    if (!botData.ok) {
      console.error('❌ Неверный токен бота!')
      console.log('Ошибка:', botData.description)
      return
    }
    
    console.log('✅ Бот найден:', botData.result.username)
    console.log('📝 Имя бота:', botData.result.first_name)
    
    // Получаем обновления (чтобы найти chat_id)
    console.log('\n🔍 Поиск chat_id...')
    const updates = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`)
    const updatesData = await updates.json()
    
    if (updatesData.ok && updatesData.result.length > 0) {
      console.log('\n📨 Найдены сообщения:')
      updatesData.result.forEach((update, index) => {
        if (update.message) {
          console.log(`${index + 1}. Chat ID: ${update.message.chat.id}`)
          console.log(`   От: ${update.message.from.first_name}`)
          console.log(`   Текст: "${update.message.text}"`)
          console.log('')
        }
      })
      
      if (!chatId) {
        console.log('💡 Скопируйте нужный Chat ID в .env.local:')
        console.log('   TELEGRAM_CHAT_ID=your_chat_id_here')
      }
    } else {
      console.log('📭 Сообщений не найдено')
      console.log('\n💡 Для получения chat_id:')
      console.log(`1. Найдите вашего бота: @${botData.result.username}`)
      console.log('2. Напишите боту любое сообщение (например, /start)')
      console.log('3. Запустите этот скрипт снова')
    }
    
    // Тестируем отправку сообщения, если chat_id есть
    if (chatId) {
      console.log('\n📤 Тестирование отправки сообщения...')
      
      const testMessage = `🧪 Тестовое сообщение от FireWorks!\n\n⏰ ${new Date().toLocaleString('ru-RU')}`
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMessage,
        }),
      })
      
      const result = await response.json()
      
      if (result.ok) {
        console.log('✅ Сообщение отправлено успешно!')
        console.log('🎉 Telegram бот настроен правильно!')
      } else {
        console.error('❌ Ошибка при отправке сообщения:')
        console.error('Код ошибки:', result.error_code)
        console.error('Описание:', result.description)
        
        if (result.error_code === 400) {
          console.log('\n💡 Возможные причины ошибки 400:')
          console.log('- Неверный chat_id')
          console.log('- Пользователь не начал диалог с ботом')
          console.log('- Бот заблокирован пользователем')
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка при работе с Telegram API:', error.message)
  }
}

// Дополнительная функция для очистки webhook (если был настроен)
async function clearWebhook() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) return
  
  console.log('\n🧹 Очистка webhook...')
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`)
    const result = await response.json()
    
    if (result.ok) {
      console.log('✅ Webhook очищен')
    }
  } catch (error) {
    console.log('⚠️ Не удалось очистить webhook:', error.message)
  }
}

async function main() {
  await setupTelegram()
  await clearWebhook()
}

main().catch(console.error)