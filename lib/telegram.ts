interface TelegramConsultationNotification {
  consultationId: string
  name: string
  contactMethod: 'telegram' | 'whatsapp' | 'phone'
  contactInfo: string
  message?: string
}

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
  professionalLaunchRequested?: boolean
  deliveryMethod: 'delivery' | 'pickup'
  deliveryAddress?: string
  deliveryCost: number
}

export async function sendConsultationNotification(consultation: TelegramConsultationNotification) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('Telegram bot token or chat ID not configured')
    return
  }

  const contactMethodText = {
    'phone': '📞 Телефон',
    'telegram': '📱 Telegram',
    'whatsapp': '📱 WhatsApp'
  }[consultation.contactMethod]

  const messageText = consultation.message
    ? `\n\n💬 Комментарий: ${consultation.message}`
    : ''

  const message = `
🎆 *Новая заявка на консультацию!*

🆔 ID: #${consultation.consultationId.slice(0, 8)}
👤 Имя: ${consultation.name}
${contactMethodText}: ${consultation.contactInfo}${messageText}

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

    console.log('Consultation notification sent successfully')
  } catch (error) {
    console.error('Failed to send consultation notification:', error)
    // Не прерываем процесс создания заявки из-за ошибки Telegram
  }
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

  const professionalLaunchText = order.professionalLaunchRequested
    ? '\n🎆 *ЗАПРОШЕН ПРОФЕССИОНАЛЬНЫЙ ЗАПУСК САЛЮТОВ* 🎆\n⚠️ Менеджер должен обсудить детали и стоимость с клиентом'
    : ''

  const deliveryText = order.deliveryMethod === 'pickup'
    ? '\n🏬 **Самовывоз** (бесплатно)\n📍 Рассветная ул., 1, д. Чёрное, Балашиха'
    : `\n🚚 **Доставка** - ${order.deliveryCost.toLocaleString('ru-RU')} ₽${order.deliveryAddress ? `\n📍 ${order.deliveryAddress}` : '\n📍 _Адрес уточнит менеджер_'}`

  const message = `
🎆 *Новый заказ!*

🆔 Заказ: #${order.orderId.slice(0, 8)}
👤 Клиент: ${order.customerName}
📞 Телефон: ${order.customerPhone}${contactInfo}

🛒 *Товары:*
${itemsText}

💰 *Итого: ${order.totalAmount.toLocaleString('ru-RU')} ₽*${deliveryText}${commentText}${professionalLaunchText}

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
