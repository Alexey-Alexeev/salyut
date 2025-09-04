import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/db/schema';
import { z } from 'zod';
import { eq, desc, sql } from 'drizzle-orm';
import { sendTelegramNotification } from '@/lib/telegram';
import postgres from 'postgres';

// Force Node.js runtime for database operations
export const runtime = 'nodejs';

const orderSchema = z.object({
  customer_name: z.string().min(2),
  customer_phone: z.string().min(10),
  customer_contact: z.string().optional().nullable(),
  contact_method: z.enum(['telegram', 'whatsapp']).optional().nullable(),
  comment: z.string().optional().nullable(),
  total_amount: z.number().positive(),
  delivery_cost: z.number().min(0),
  discount_amount: z.number().min(0),
  age_confirmed: z.boolean(),
  professional_launch_requested: z.boolean().optional(),
  delivery_method: z.enum(['delivery', 'pickup']),
  delivery_address: z.string().optional().nullable(),
  distance_from_mkad: z.number().int().min(0).optional().nullable(), // расстояние от МКАД в км
  items: z.array(
    z.object({
      product_id: z.string(),
      quantity: z.number().positive(),
      price_at_time: z.number().positive(),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== Начало создания заказа ===');

    const body = await request.json();
    console.log('Полученные данные:', JSON.stringify(body, null, 2));

    const validatedData = orderSchema.parse(body);
    console.log('Данные прошли валидацию:', validatedData);

    // Создаем заказ
    console.log('Создаем заказ в базе данных...');

    const orderData = {
      customer_name: validatedData.customer_name,
      customer_phone: validatedData.customer_phone,
      customer_contact: validatedData.customer_contact || null,
      contact_method: validatedData.contact_method || null,
      comment: validatedData.comment || null,
      total_amount: Math.round(validatedData.total_amount),
      delivery_cost: Math.round(validatedData.delivery_cost),
      discount_amount: Math.round(validatedData.discount_amount),
      age_confirmed: validatedData.age_confirmed,
      professional_launch_requested:
        validatedData.professional_launch_requested || false,
      delivery_method: validatedData.delivery_method,
      delivery_address: validatedData.delivery_address || null,
      distance_from_mkad: validatedData.distance_from_mkad || null,
    };

    console.log('Данные для вставки:', orderData);

    let order;
    try {
      // Use raw SQL to avoid parameter concatenation issues
      const result = await db.execute(sql`
        INSERT INTO orders (
          customer_name, customer_phone, customer_contact, 
          contact_method, comment, total_amount, 
          delivery_cost, discount_amount, age_confirmed, professional_launch_requested,
          delivery_method, delivery_address, distance_from_mkad
        ) VALUES (
          ${orderData.customer_name}, ${orderData.customer_phone}, ${orderData.customer_contact},
          ${orderData.contact_method}, ${orderData.comment}, ${orderData.total_amount},
          ${orderData.delivery_cost}, ${orderData.discount_amount}, ${orderData.age_confirmed}, ${orderData.professional_launch_requested},
          ${orderData.delivery_method}, ${orderData.delivery_address}, ${orderData.distance_from_mkad}
        ) RETURNING *
      `);

      order = result[0] as any;
      console.log('✅ Заказ создан успешно!', order);
    } catch (insertError) {
      console.error('❌ Ошибка при вставке заказа:', insertError);
      throw insertError;
    }

    console.log('Заказ создан с ID:', order.id);

    // Создаем элементы заказа
    if (order && validatedData.items.length > 0) {
      console.log(`Создаем ${validatedData.items.length} элементов заказа...`);

      // Use raw SQL for order items as well
      for (const item of validatedData.items) {
        await db.execute(sql`
          INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
          VALUES (${order.id}, ${item.product_id}, ${Math.round(item.quantity)}, ${Math.round(item.price_at_time)})
        `);
      }

      console.log('Элементы заказа созданы');
    }

    // Получаем информацию о товарах для уведомления
    console.log('Получаем информацию о товарах...');
    const orderItemsWithProducts = await Promise.all(
      validatedData.items.map(async item => {
        try {
          const result = await db.execute(sql`
            SELECT name FROM products WHERE id = ${item.product_id} LIMIT 1
          `);

          return {
            name: (result[0] as any)?.name || 'Товар',
            quantity: item.quantity,
            price: item.price_at_time,
          };
        } catch (error) {
          console.error('Error fetching product name:', error);
          return {
            name: 'Товар',
            quantity: item.quantity,
            price: item.price_at_time,
          };
        }
      })
    );

    console.log('Информация о товарах получена:', orderItemsWithProducts);

    // Отправляем уведомление в Telegram
    console.log('Отправляем уведомление в Telegram...');
    console.log('validatedData', validatedData);
    try {
      await sendTelegramNotification({
        orderId: order.id as string,
        customerName: validatedData.customer_name,
        customerPhone: validatedData.customer_phone,
        totalAmount: validatedData.total_amount,
        items: orderItemsWithProducts,
        comment: validatedData.comment || undefined,
        contactMethod: validatedData.contact_method || undefined,
        customerContact: validatedData.customer_contact || undefined,
        professionalLaunchRequested:
          validatedData.professional_launch_requested || false,
        deliveryMethod: validatedData.delivery_method,
        deliveryAddress: validatedData.delivery_address || undefined,
        deliveryCost: validatedData.delivery_cost,
        distanceFromMKAD: validatedData.distance_from_mkad || undefined,
      });
      console.log('Уведомление в Telegram отправлено');
    } catch (telegramError) {
      console.error('Ошибка при отправке Telegram уведомления:', telegramError);
      // Не прерываем процесс из-за ошибки Telegram
      console.log('Заказ создан успешно, но уведомление не отправлено');
    }

    console.log('Заказ успешно создан!');

    return NextResponse.json(
      {
        success: true,
        order_id: order.id as string,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('=== Ошибка при создании заказа ===', error);

    if (error instanceof z.ZodError) {
      console.error('Ошибки валидации:', error.issues);
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    // Проверяем, что это ошибка базы данных
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Ошибка базы данных:', {
        code: (error as any).code,
        message: (error as any).message,
        detail: (error as any).detail,
      });
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const status = searchParams.get('status')
//     const page = parseInt(searchParams.get('page') || '1')
//     const limit = parseInt(searchParams.get('limit') || '10')
//     const offset = (page - 1) * limit
//
//     let query = db.select().from(orders)
//
//     if (status) {
//       query = query.where(eq(orders.status, status))
//     }
//
//     const [ordersData, totalCount] = await Promise.all([
//       query.limit(limit).offset(offset).orderBy(desc(orders.created_at)),
//       db.select({ count: sql`count(*)` }).from(orders)
//     ])
//
//     return NextResponse.json({
//       orders: ordersData,
//       pagination: {
//         page,
//         limit,
//         total: totalCount[0].count,
//         totalPages: Math.ceil(totalCount[0].count / limit)
//       }
//     })
//
//   } catch (error) {
//     console.error('Error fetching orders:', error)
//     return NextResponse.json({
//       error: 'Internal server error'
//     }, { status: 500 })
//   }
// }
