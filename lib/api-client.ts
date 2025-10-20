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

        // Отладочная информация для API
        console.log('🔍 fetchProducts Debug Info:');
        console.log('📋 Filters received:', filters);
        console.log('🏷️ Category IDs:', categoryId);
        console.log('🔍 Search term:', search);

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

        if (error) {
            console.error('❌ Supabase query error:', error);
            throw error;
        }

        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        // Отладочная информация результата
        console.log('📦 Supabase Query Result:');
        console.log('📊 Total count:', totalCount);
        console.log('📦 Products found:', products?.length || 0);
        console.log('🏷️ Products:', products?.map(p => ({ id: p.id, name: p.name, category_id: p.category_id })));

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

// Вспомогательная функция для отправки уведомлений в Telegram через Supabase Edge Function
async function sendTelegramNotification(order: any, items: any[]) {
    try {
        const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
            body: {
                type: 'order',
                data: { order, items }
            }
        });

        if (error) {
            console.error('Failed to send Telegram notification:', error);
        } else {
            console.log('Telegram notification sent successfully');
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
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
    try {
        const { data, error } = await supabase.functions.invoke('send-telegram-notification', {
            body: {
                type: 'consultation',
                data: { consultation }
            }
        });

        if (error) {
            console.error('Failed to send Telegram notification:', error);
        } else {
            console.log('Telegram notification sent successfully');
        }
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
}

