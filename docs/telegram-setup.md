# Telegram Order Notifications Setup

## 🚀 Quick Setup (Recommended for your use case)

### 1. Create Telegram Bot
```bash
# 1. Message @BotFather on Telegram
# 2. Send: /newbot
# 3. Choose bot name: "КупитьСалюты Orders Bot"
# 4. Choose username: "kupitsalyuty_orders_bot" (or similar)
# 5. Save the TOKEN you receive
```

### 2. Get Your Chat ID
```bash
# Option A: Send message to your bot, then visit:
# https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates

# Option B: Use this JavaScript in browser console:
# After sending /start to your bot, run:
fetch('https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates')
  .then(r => r.json())
  .then(data => console.log('Your Chat ID:', data.result[0].message.chat.id))
```

### 3. Environment Variables (reg.ru hosting)
```env
# Add to your .env.local and reg.ru environment:
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHAT_ID=your_personal_chat_id

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
DATABASE_URL=your_supabase_database_url
```

### 4. Enable Notifications in Code
```typescript
// In app/api/orders/route.ts - uncomment line 55:
await sendTelegramNotification({
  orderId: order.id,
  customerName: validatedData.customer_name,
  customerPhone: validatedData.customer_phone,
  // ... rest of the notification data
})
```

## 📱 Message Format You'll Receive

```
🎆 Новый заказ!

🆔 Заказ: #abc12345
👤 Клиент: Иван Петров
📞 Телефон: +7 (977) 360-20-08
📱 Telegram: @ivan_petrov

🛒 Товары:
• Римская свеча "Золотой дождь" - 2 шт. × 1,500 ₽
• Петарды "Корсар-1" - 1 шт. × 2,300 ₽

💰 Итого: 5,300 ₽
💬 Комментарий: Доставка на дачу

⏰ Время: 27.08.2025, 14:30
```

## 🔄 Order Management Workflow

### For You (Business Owner):
1. **Receive Order** → Instant Telegram notification
2. **Process Order** → Use web admin panel at yourdomain.com/admin/orders  
3. **Update Status** → Customer gets automatic status updates
4. **Track Analytics** → Dashboard shows revenue, popular products

### For Customers:
1. **Place Order** → Confirmation on website + email
2. **Get Updates** → Status changes via their preferred contact method
3. **Support** → Can reach you via consultation form or direct Telegram/WhatsApp

## 🛠️ Advanced Options (Future Enhancements)

### Option A: Telegram Bot with Commands
```typescript
// Future enhancement: Interactive bot commands
/orders - List recent orders
/order_123456 - Get order details  
/complete_123456 - Mark order complete
/stats - Show daily/weekly stats
```

### Option B: WhatsApp Business Integration  
```typescript
// Alternative: WhatsApp Business API
// For customers who prefer WhatsApp over Telegram
```

## 🚀 Deployment on reg.ru

### 1. Environment Variables Setup
```bash
# In reg.ru hosting panel, add environment variables:
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 2. Webhook Configuration (Optional)
```typescript
// For instant delivery, set webhook (optional):
// POST to: https://api.telegram.org/bot<TOKEN>/setWebhook
{
  "url": "https://yourdomain.com/api/telegram/webhook",
  "allowed_updates": ["message"]
}
```

## ✅ Testing Checklist

- [ ] Bot created and token obtained
- [ ] Chat ID retrieved  
- [ ] Environment variables set
- [ ] Test order placed
- [ ] Telegram notification received
- [ ] Admin panel accessible
- [ ] Order status updates work

## 🎯 Why This Approach Works Best for You

1. **Simple & Reliable**: No complex bot logic, just notifications
2. **reg.ru Compatible**: Standard HTTP requests, no special server requirements  
3. **Scalable**: Easy to add WhatsApp, email, or SMS later
4. **Professional**: Clean message format, automated workflow
5. **Cost-Effective**: Free Telegram Bot API, minimal server resources

## 📞 Support

If you need help with setup:
- Check logs in `/api/orders` endpoint
- Test Telegram API manually: `curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" -d "chat_id=<CHAT_ID>&text=Test"`
- Verify environment variables in reg.ru panel