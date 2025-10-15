/**
 * Клиентские функции для работы с Supabase
 * Используются для замены API routes в режиме static export
 */

import { supabase } from '@/lib/supabase';

// ================== PRODUCTS ==================

export interface ProductFilters {
    search?: string;
    categoryId?: string[];
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    page?: number;
    limit?: number;
}

export async function fetchProducts(filters: ProductFilters = {}) {
    try {
        const {
            search,
            categoryId,
            minPrice,
            maxPrice,
            sortBy = 'name',
            page = 1,
            limit = 20,
        } = filters;

        // Начинаем с базового запроса
        let query = supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('is_active', true);

        // Применяем фильтры
        if (search && search.trim()) {
            query = query.ilike('name', `%${search.trim()}%`);
        }

        if (categoryId && categoryId.length > 0) {
            query = query.in('category_id', categoryId);
        }

        if (minPrice !== undefined && minPrice > 0) {
            query = query.gte('price', minPrice);
        }

        if (maxPrice !== undefined && maxPrice > 0) {
            query = query.lte('price', maxPrice);
        }

        // Сортировка
        switch (sortBy) {
            case 'price-asc':
            case 'price_asc':
                query = query.order('price', { ascending: true });
                break;
            case 'price-desc':
            case 'price_desc':
                query = query.order('price', { ascending: false });
                break;
            case 'popular':
                // Стандартная сортировка Supabase: true, null, false
                query = query.order('is_popular', { ascending: false }).order('name', { ascending: true });
                break;
            case 'name':
            default:
                query = query.order('name', { ascending: true });
                break;
        }

        // Пагинация
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data: products, error, count } = await query;

        if (error) throw error;

        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        return {
            products: products || [],
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// ================== ORDERS ==================

export interface CreateOrderData {
    customer_name: string;
    customer_contact: string | null;
    contact_method: string;
    comment?: string | null;
    total_amount: number;
    delivery_cost: number;
    discount_amount: number;
    age_confirmed: boolean;
    professional_launch_requested?: boolean;
    delivery_method: 'delivery' | 'pickup';
    delivery_address?: string | null;
    distance_from_mkad?: number | null;
    items: Array<{
        product_id: string;
        quantity: number;
        price_at_time: number;
    }>;
}

export async function createOrder(orderData: CreateOrderData) {
    try {
        // Используем Supabase для создания заказа
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_name: orderData.customer_name,
                customer_contact: orderData.customer_contact,
                contact_method: orderData.contact_method,
                comment: orderData.comment,
                total_amount: orderData.total_amount,
                delivery_cost: orderData.delivery_cost,
                discount_amount: orderData.discount_amount,
                age_confirmed: orderData.age_confirmed,
                professional_launch_requested: orderData.professional_launch_requested || false,
                delivery_method: orderData.delivery_method,
                delivery_address: orderData.delivery_address,
                distance_from_mkad: orderData.distance_from_mkad,
                status: 'created',
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // Создаем items заказа
        const orderItemsData = orderData.items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_time: item.price_at_time,
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData);

        if (itemsError) throw itemsError;

        // Получаем названия товаров для Telegram уведомления
        const productIds = orderData.items.map(item => item.product_id);
        const { data: products } = await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds);

        // Создаем массив товаров с названиями
        const itemsWithNames = orderData.items.map(item => {
            const product = products?.find(p => p.id === item.product_id);
            return {
                product_id: item.product_id,
                name: product?.name || 'Товар',
                quantity: item.quantity,
                price: item.price_at_time,
            };
        });

        // Отправляем уведомление в Telegram (если настроено)
        try {
            await sendTelegramNotification(order, itemsWithNames);
        } catch (telegramError) {
            console.error('Failed to send telegram notification:', telegramError);
            // Не прерываем выполнение, если Telegram не отправился
        }

        return { success: true, order };
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

// Вспомогательная функция для отправки уведомлений в Telegram
async function sendTelegramNotification(order: any, items: any[]) {
    // Получаем токены только из переменных окружения
    const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    console.log('Telegram credentials check:', {
        hasToken: !!TELEGRAM_BOT_TOKEN,
        hasChatId: !!TELEGRAM_CHAT_ID,
        tokenLength: TELEGRAM_BOT_TOKEN?.length || 0,
        chatId: TELEGRAM_CHAT_ID
    });

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('Telegram credentials not configured');
        return;
    }

    // Формируем сообщение в старом формате
    const shortId = order.id.slice(0, 8);
    const contactMethodText = order.contact_method && order.customer_contact
        ? `\n📱 ${order.contact_method === 'telegram' ? 'Telegram' : order.contact_method === 'whatsapp' ? 'WhatsApp' : 'Телефон'}: ${order.customer_contact}`
        : '';

    const commentText = order.comment ? `\n💬 Комментарий: ${order.comment}` : '';

    const professionalLaunchText = order.professional_launch_requested
        ? '\n🎆 Запуск салютов: *Да* \n⚠️ Обсудить детали и стоимость запуска салютов'
        : '';

    const deliveryText = order.delivery_method === 'pickup'
        ? '\n🏬 **Самовывоз** (бесплатно)\n📍 Рассветная ул., 14, д. Чёрное, Балашиха'
        : `\n🚚 **Доставка** - ${order.delivery_cost.toLocaleString('ru-RU')} ₽${order.delivery_address ? `\n📍 ${order.delivery_address}` : '\n📍 _Адрес не указан. Необходимо уточнить_'}`;

    const distanceFromMKADText = order.distance_from_mkad
        ? `\n🚗 Расстояние от МКАД: ${order.distance_from_mkad} км`
        : '';

    // Определяем тип скидки/подарка
    let discountInfo = '';
    const subtotal = order.total_amount - order.discount_amount;
    if (subtotal >= 60000) {
        discountInfo = `\n🎁 *Бонусы:* 10% скидка + подарок включены`;
    } else if (subtotal >= 40000) {
        discountInfo = `\n🎁 *Бонусы:* 5% скидка + подарок включены`;
    } else if (subtotal >= 10000) {
        discountInfo = `\n🎁 *Бонусы:* подарок включен`;
    }

    const itemsText = items
        .map(item => `• ${item.name} - ${item.quantity} шт. × ${item.price.toLocaleString('ru-RU')} ₽`)
        .join('\n');

    const message = `
🎆 *Новый заказ!*

🆔 Заказ: #${shortId}
👤 Клиент: ${order.customer_name}${contactMethodText}

🛒 *Товары:*
${itemsText}

${deliveryText}${distanceFromMKADText}${discountInfo}${commentText}${professionalLaunchText}

💰 *Итого: ${order.total_amount.toLocaleString('ru-RU')} ₽*

⏰ Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    // Отправляем в Telegram
    try {
        console.log('Sending telegram notification:', { chatId: TELEGRAM_CHAT_ID, messageLength: message.length });

        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });

        const result = await response.json();
        console.log('Telegram response:', result);

        if (!response.ok) {
            console.error('Telegram API error:', result);
        }
    } catch (error) {
        console.error('Failed to send telegram message:', error);
    }
}

// ================== CONSULTATIONS ==================

export interface CreateConsultationData {
    name: string;
    contactMethod: string;
    contactInfo: string;
    message?: string;
}

export async function createConsultation(data: CreateConsultationData) {
    try {
        const { data: consultation, error } = await supabase
            .from('consultations')
            .insert({
                name: data.name,
                contact_method: data.contactMethod,
                contact_info: data.contactInfo,
                message: data.message || null,
                status: 'new',
            })
            .select()
            .single();

        if (error) throw error;

        // Отправляем уведомление в Telegram
        try {
            await sendConsultationTelegramNotification(consultation);
        } catch (telegramError) {
            console.error('Failed to send telegram notification:', telegramError);
        }

        return { success: true, consultation };
    } catch (error) {
        console.error('Error creating consultation:', error);
        throw error;
    }
}

async function sendConsultationTelegramNotification(consultation: any) {
    // Получаем токены только из переменных окружения
    const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('Telegram credentials not configured');
        return;
    }

    // Формируем сообщение в старом формате
    const shortId = consultation.id.slice(0, 8);
    const contactMethodMap: Record<string, string> = {
        phone: '📞 Телефон',
        telegram: '📱 Telegram',
        whatsapp: '📱 WhatsApp',
    };
    const contactMethodText = contactMethodMap[consultation.contact_method] || '📞 Контакт';

    const messageText = consultation.message
        ? `\n\n💬 Комментарий: ${consultation.message}`
        : '';

    const message = `
🎆 *Новая заявка на консультацию!*

🆔 ID: #${shortId}
👤 Имя: ${consultation.name}
${contactMethodText}: ${consultation.contact_info}${messageText}

⏰ Время: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });
    } catch (error) {
        console.error('Failed to send telegram message:', error);
    }
}

