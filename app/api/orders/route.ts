import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems } from '@/db/schema'
import { z } from 'zod'
import { eq, desc, sql } from 'drizzle-orm'
import { sendTelegramNotification } from '@/lib/telegram'

const orderSchema = z.object({
  customer_name: z.string().min(2),
  customer_phone: z.string().min(10),
  customer_contact: z.string().optional(),
  contact_method: z.enum(['telegram', 'whatsapp']).optional(),
  comment: z.string().optional(),
  total_amount: z.number().positive(),
  delivery_cost: z.number().min(0),
  discount_amount: z.number().min(0),
  age_confirmed: z.boolean(),
  items: z.array(z.object({
    product_id: z.string(),
    quantity: z.number().positive(),
    price_at_time: z.number().positive(),
  }))
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = orderSchema.parse(body)

    // Создаем заказ
    const [order] = await db.insert(orders).values({
      customer_name: validatedData.customer_name,
      customer_phone: validatedData.customer_phone,
      customer_contact: validatedData.customer_contact,
      contact_method: validatedData.contact_method,
      comment: validatedData.comment,
      total_amount: validatedData.total_amount,
      delivery_cost: validatedData.delivery_cost,
      discount_amount: validatedData.discount_amount,
      age_confirmed: validatedData.age_confirmed,
    }).returning()

    // Создаем элементы заказа
    if (order && validatedData.items.length > 0) {
      await db.insert(orderItems).values(
        validatedData.items.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
        }))
      )
    }

    // Отправляем уведомление в Telegram
    await sendTelegramNotification({
      orderId: order.id,
      customerName: validatedData.customer_name,
      customerPhone: validatedData.customer_phone,
      totalAmount: validatedData.total_amount,
      items: validatedData.items.map(item => ({
        name: 'Товар', // Здесь нужно получить название товара из базы
        quantity: item.quantity,
        price: item.price_at_time
      })),
      comment: validatedData.comment,
      contactMethod: validatedData.contact_method,
      customerContact: validatedData.customer_contact
    })

    return NextResponse.json({ 
      success: true, 
      order_id: order.id 
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating order:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    let query = db.select().from(orders)

    if (status) {
      query = query.where(eq(orders.status, status))
    }

    const [ordersData, totalCount] = await Promise.all([
      query.limit(limit).offset(offset).orderBy(desc(orders.created_at)),
      db.select({ count: sql`count(*)` }).from(orders)
    ])

    return NextResponse.json({
      orders: ordersData,
      pagination: {
        page,
        limit,
        total: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
