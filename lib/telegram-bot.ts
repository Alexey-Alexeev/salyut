// lib/telegram-bot.ts
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';

interface TelegramUpdate {
  message: {
    chat: { id: number };
    text: string;
    from: { id: number };
  };
}

export class TelegramOrderBot {
  private botToken: string;
  private authorizedUsers: number[];

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    // Add your Telegram user ID here for security
    this.authorizedUsers = [
      parseInt(process.env.TELEGRAM_ADMIN_USER_ID || '0'),
    ];
  }

  async handleUpdate(update: TelegramUpdate) {
    const { message } = update;

    if (!this.isAuthorized(message.from.id)) {
      await this.sendMessage(
        message.chat.id,
        '❌ У вас нет доступа к этому боту'
      );
      return;
    }

    const text = message.text.toLowerCase();

    try {
      if (text.startsWith('/start')) {
        await this.sendHelp(message.chat.id);
      } else if (text.startsWith('/orders')) {
        await this.sendRecentOrders(message.chat.id);
      } else if (text.startsWith('/stats')) {
        await this.sendStats(message.chat.id);
      } else if (text.startsWith('/order_')) {
        const orderId = text.replace('/order_', '');
        await this.sendOrderDetails(message.chat.id, orderId);
      } else if (text.startsWith('/complete_')) {
        const orderId = text.replace('/complete_', '');
        await this.updateOrderStatus(message.chat.id, orderId, 'completed');
      } else if (text.startsWith('/cancel_')) {
        const orderId = text.replace('/cancel_', '');
        await this.updateOrderStatus(message.chat.id, orderId, 'cancelled');
      } else {
        await this.sendHelp(message.chat.id);
      }
    } catch (error) {
      console.error('Bot error:', error);
      await this.sendMessage(
        message.chat.id,
        '❌ Произошла ошибка при обработке команды'
      );
    }
  }

  private isAuthorized(userId: number): boolean {
    return this.authorizedUsers.includes(userId);
  }

  private async sendMessage(chatId: number, text: string) {
    if (!this.botToken) return;

    await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
  }

  private async sendHelp(chatId: number) {
    const helpText = `
🎆 *СалютГрад - Управление заказами*

*Доступные команды:*

📋 \`/orders\` - Последние 5 заказов
📊 \`/stats\` - Статистика заказов
🔍 \`/order_XXXXXX\` - Детали заказа
✅ \`/complete_XXXXXX\` - Завершить заказ
❌ \`/cancel_XXXXXX\` - Отменить заказ

*Пример:*
\`/order_abc12345\` - показать заказ
\`/complete_abc12345\` - завершить заказ

💡 *Совет:* Используйте кнопки в уведомлениях о новых заказах для быстрого управления!
    `.trim();

    await this.sendMessage(chatId, helpText);
  }

  private async sendRecentOrders(chatId: number) {
    try {
      const recentOrders = await db
        .select({
          id: orders.id,
          customer_name: orders.customer_name,
          total_amount: orders.total_amount,
          status: orders.status,
          created_at: orders.created_at,
        })
        .from(orders)
        .orderBy(desc(orders.created_at))
        .limit(5);

      if (recentOrders.length === 0) {
        await this.sendMessage(chatId, '📭 Новых заказов нет');
        return;
      }

      let message = '📋 *Последние заказы:*\n\n';

      for (const order of recentOrders) {
        const shortId = order.id.slice(0, 8);
        const amount = order.total_amount.toLocaleString('ru-RU');
        const date = order.created_at
          ? new Date(order.created_at).toLocaleDateString('ru-RU')
          : 'Н/Д';
        const statusEmoji = this.getStatusEmoji(order.status || 'created');

        message += `${statusEmoji} \`#${shortId}\` - ${order.customer_name}\n`;
        message += `💰 ${amount} ₽ | 📅 ${date}\n\n`;
      }

      message += `\n💡 Используйте \`/order_XXXXXX\` для подробностей`;

      await this.sendMessage(chatId, message);
    } catch (error) {
      await this.sendMessage(chatId, '❌ Ошибка при загрузке заказов');
    }
  }

  private async sendStats(chatId: number) {
    try {
      const [totalOrders] = await db.select({ count: count() }).from(orders);

      const ordersByStatus = await db
        .select({
          status: orders.status,
          total_amount: orders.total_amount,
        })
        .from(orders);

      const stats = ordersByStatus.reduce(
        (acc, order) => {
          const status = order.status || 'created';
          acc[status as keyof typeof acc] =
            (acc[status as keyof typeof acc] || 0) + 1;
          acc.revenue += order.total_amount;
          return acc;
        },
        {
          created: 0,
          in_progress: 0,
          completed: 0,
          cancelled: 0,
          revenue: 0,
        }
      );

      const message = `
📊 *Статистика заказов*

📋 Всего заказов: ${totalOrders.count}
🆕 Новых: ${stats.created}
🔄 В обработке: ${stats.in_progress}
✅ Завершено: ${stats.completed}
❌ Отменено: ${stats.cancelled}

💰 Общая выручка: ${stats.revenue.toLocaleString('ru-RU')} ₽

📅 Обновлено: ${new Date().toLocaleString('ru-RU')}
      `.trim();

      await this.sendMessage(chatId, message);
    } catch (error) {
      await this.sendMessage(chatId, '❌ Ошибка при загрузке статистики');
    }
  }

  private async sendOrderDetails(chatId: number, orderId: string) {
    try {
      // Find order by short ID (first 8 characters)
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!order) {
        await this.sendMessage(chatId, `❌ Заказ #${orderId} не найден`);
        return;
      }

      // Get order items with product names
      const items = await db
        .select({
          quantity: orderItems.quantity,
          price_at_time: orderItems.price_at_time,
          product_name: products.name,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.product_id, products.id))
        .where(eq(orderItems.order_id, order.id));

      const shortId = order.id.slice(0, 8);
      const statusEmoji = this.getStatusEmoji(order.status || 'created');
      const itemsText = items
        .map(
          item =>
            `• ${item.product_name || 'Товар'} - ${item.quantity} шт. × ${item.price_at_time.toLocaleString('ru-RU')} ₽`
        )
        .join('\n');

      const contactInfo =
        order.contact_method && order.customer_contact
          ? `\n📱 ${order.contact_method === 'telegram' ? 'Telegram' : 'WhatsApp'}: ${order.customer_contact}`
          : '';

      const createdAt = order.created_at
        ? new Date(order.created_at).toLocaleString('ru-RU')
        : 'Н/Д';

      const message = `
${statusEmoji} *Заказ #${shortId}*

👤 Клиент: ${order.customer_name}
📞 Телефон: ${order.customer_phone}${contactInfo}

🛒 *Товары:*
${itemsText}

💰 *Итого: ${order.total_amount.toLocaleString('ru-RU')} ₽*
${order.comment ? `💬 Комментарий: ${order.comment}` : ''}

📅 Создан: ${createdAt}

*Быстрые команды:*
\`/complete_${order.id}\` - Завершить
\`/cancel_${order.id}\` - Отменить
      `.trim();

      await this.sendMessage(chatId, message);
    } catch (error) {
      await this.sendMessage(chatId, '❌ Ошибка при загрузке заказа');
    }
  }

  private async updateOrderStatus(
    chatId: number,
    orderId: string,
    newStatus: string
  ) {
    try {
      const [updated] = await db
        .update(orders)
        .set({ status: newStatus as any })
        .where(eq(orders.id, orderId))
        .returning({ customer_name: orders.customer_name });

      if (!updated) {
        await this.sendMessage(
          chatId,
          `❌ Заказ #${orderId.slice(0, 8)} не найден`
        );
        return;
      }

      const statusText =
        {
          completed: 'завершен ✅',
          cancelled: 'отменен ❌',
          in_progress: 'в обработке 🔄',
        }[newStatus] || newStatus;

      await this.sendMessage(
        chatId,
        `✅ Заказ #${orderId.slice(0, 8)} ${statusText}\nКлиент: ${updated.customer_name}`
      );

      // Send status update notification if enabled
      // await sendOrderStatusUpdate(orderId, newStatus, updated.customer_name)
    } catch (error) {
      await this.sendMessage(chatId, '❌ Ошибка при обновлении статуса');
    }
  }

  private getStatusEmoji(status: string): string {
    const emojis = {
      created: '🆕',
      in_progress: '🔄',
      completed: '✅',
      cancelled: '❌',
    };
    return emojis[status as keyof typeof emojis] || '📝';
  }

  // Enhanced notification with action buttons
  async sendEnhancedOrderNotification(order: any) {
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!chatId) return;

    const message = `
🎆 *Новый заказ!*

🆔 Заказ: #${order.orderId.slice(0, 8)}
👤 Клиент: ${order.customerName}
📞 Телефон: ${order.customerPhone}
${order.contactMethod && order.customerContact ? `📱 ${order.contactMethod === 'telegram' ? 'Telegram' : 'WhatsApp'}: ${order.customerContact}` : ''}

🛒 *Товары:*
${order.items.map((item: any) => `• ${item.name} - ${item.quantity} шт. × ${item.price.toLocaleString('ru-RU')} ₽`).join('\n')}

💰 *Итого: ${order.totalAmount.toLocaleString('ru-RU')} ₽*
${order.comment ? `💬 Комментарий: ${order.comment}` : ''}

⏰ Время: ${new Date().toLocaleString('ru-RU')}

*Быстрые команды:*
\`/order_${order.orderId}\` - Детали
\`/complete_${order.orderId}\` - Завершить  
\`/cancel_${order.orderId}\` - Отменить
    `.trim();

    await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });
  }
}

export const telegramBot = new TelegramOrderBot();
