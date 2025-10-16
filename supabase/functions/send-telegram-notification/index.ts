import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()

    // Получаем токены из переменных окружения Supabase
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Telegram credentials not configured')
    }

    let message = ''

    if (type === 'order') {
      const { order, items } = data
      
      // Формируем сообщение для заказа
      const shortId = order.id.slice(0, 8)
      const contactMethodText = order.contact_method && order.customer_contact
        ? `\n📱 ${order.contact_method === 'telegram' ? 'Telegram' : order.contact_method === 'whatsapp' ? 'WhatsApp' : 'Телефон'}: ${order.customer_contact}`
        : ''

      const commentText = order.comment ? `\n💬 Комментарий: ${order.comment}` : ''

      const professionalLaunchText = order.professional_launch_requested
        ? '\n🎆 Запуск салютов: *Да* \n⚠️ Обсудить детали и стоимость запуска салютов'
        : ''

      const deliveryText = order.delivery_method === 'pickup'
        ? '\n🏬 **Самовывоз** (бесплатно)\n📍 Рассветная ул., 14, д. Чёрное, Балашиха'
        : `\n🚚 **Доставка** - ${order.delivery_cost.toLocaleString('ru-RU')} ₽${order.delivery_address ? `\n📍 ${order.delivery_address}` : '\n📍 _Адрес не указан. Необходимо уточнить_'}`

      const distanceFromMKADText = order.distance_from_mkad
        ? `\n🚗 Расстояние от МКАД: ${order.distance_from_mkad} км`
        : ''

      // Определяем тип скидки/подарка
      let discountInfo = ''
      const subtotal = order.total_amount - order.discount_amount
      if (subtotal >= 60000) {
        discountInfo = `\n🎁 *Бонусы:* 10% скидка + подарок включены`
      } else if (subtotal >= 40000) {
        discountInfo = `\n🎁 *Бонусы:* 5% скидка + подарок включены`
      } else if (subtotal >= 10000) {
        discountInfo = `\n🎁 *Бонусы:* подарок включен`
      }

      const itemsText = items
        .map(item => `• ${item.name} - ${item.quantity} шт. × ${item.price.toLocaleString('ru-RU')} ₽`)
        .join('\n')

      message = `
🎆 *Новый заказ!*

🆔 Заказ: #${shortId}
👤 Клиент: ${order.customer_name}${contactMethodText}

🛒 *Товары:*
${itemsText}

${deliveryText}${distanceFromMKADText}${discountInfo}${commentText}${professionalLaunchText}

💰 *Итого: ${order.total_amount.toLocaleString('ru-RU')} ₽*

⏰ Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
      `.trim()

    } else if (type === 'consultation') {
      const { consultation } = data
      
      // Формируем сообщение для консультации
      const shortId = consultation.id.slice(0, 8)
      const contactMethodMap: Record<string, string> = {
        phone: '📞 Телефон',
        telegram: '📱 Telegram',
        whatsapp: '📱 WhatsApp',
      }
      const contactMethodText = contactMethodMap[consultation.contact_method] || '📞 Контакт'

      const messageText = consultation.message
        ? `\n\n💬 Комментарий: ${consultation.message}`
        : ''

      message = `
🎆 *Новая заявка на консультацию!*

🆔 ID: #${shortId}
👤 Имя: ${consultation.name}
${contactMethodText}: ${consultation.contact_info}${messageText}

⏰ Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
      `.trim()
    } else {
      throw new Error('Invalid notification type')
    }

    // Отправляем в Telegram
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      }
    )

    if (!telegramResponse.ok) {
      const errorData = await telegramResponse.json()
      throw new Error(`Telegram API error: ${JSON.stringify(errorData)}`)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})


