interface TelegramNotification {
  orderId: string
  customerName: string
  customerPhone: string
  totalAmount: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  comment?: string
  contactMethod?: 'telegram' | 'whatsapp'
  customerContact?: string
}

export async function sendTelegramNotification(order: TelegramNotification) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('Telegram bot token or chat ID not configured')
    return
  }

  const itemsText = order.items
    .map(item => `• ${item.name} - ${item.quantity} шт. × ${item.price.toLocaleString('ru-RU')} ₽`)
    .join('\n')

  const contactInfo = order.contactMethod && order.customerContact
    ? `\n📱 ${order.contactMethod === 'telegram' ? 'Telegram' : 'WhatsApp'}: ${order.customerContact}`
    : ''

  const commentText = order.comment ? `\n💬 Комментарий: ${order.comment}` : ''

  const message = `
🎆 *Новый заказ!*

🆔 Заказ: #${order.orderId.slice(0, 8)}
👤 Клиент: ${order.customerName}
📞 Телефон: ${order.customerPhone}${contactInfo}

🛒 *Товары:*
${itemsText}

💰 *Итого: ${order.totalAmount.toLocaleString('ru-RU')} ₽*${commentText}

⏰ Время: ${new Date().toLocaleString('ru-RU')}
  `.trim()

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.error('Telegram API error details:', {
        status: response.status,
        error_code: result.error_code,
        description: result.description,
        chat_id: chatId,
        bot_token_length: botToken.length
      })
      throw new Error(`Telegram API error: ${response.status} - ${result.description}`)
    }

    console.log('Telegram notification sent successfully')
  } catch (error) {
    console.error('Failed to send Telegram notification:', error)
    // Не прерываем процесс создания заказа из-за ошибки Telegram
    // Заказ должен быть создан даже если уведомление не отправилось
  }
}

export async function sendOrderStatusUpdate(orderId: string, status: string, customerName: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    return
  }

  const statusEmoji = {
    'in_progress': '🔄',
    'completed': '✅',
    'cancelled': '❌'
  }[status] || '📝'

  const statusText = {
    'in_progress': 'В обработке',
    'completed': 'Завершен',
    'cancelled': 'Отменен'
  }[status] || status

  const message = `
${statusEmoji} *Обновление статуса заказа*

🆔 Заказ: #${orderId.slice(0, 8)}
👤 Клиент: ${customerName}
📊 Статус: ${statusText}

⏰ Время: ${new Date().toLocaleString('ru-RU')}
  `.trim()

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`)
    }
  } catch (error) {
    console.error('Failed to send status update notification:', error)
  }
}
