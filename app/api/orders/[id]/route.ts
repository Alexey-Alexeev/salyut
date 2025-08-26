import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { orders, orderItems, products } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { sendOrderStatusUpdate } from '@/lib/telegram'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Получаем заказ с элементами
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id))
      .single()

    if (!order) {
      return NextResponse.json({ 
        error: 'Order not found' 
      }, { status: 404 })
    }

    // Получаем элементы заказа с информацией о товарах
    const orderItemsData = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price_at_time: orderItems.price_at_time,
        product: {
          id: products.id,
          name: products.name,
          images: products.images,
        }
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.product_id, products.id))
      .where(eq(orderItems.order_id, id))

    const orderWithItems = {
      ...order,
      items: orderItemsData
    }

    return NextResponse.json(orderWithItems)

  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    // Валидация статуса
    const validStatuses = ['created', 'in_progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status' 
      }, { status: 400 })
    }

    // Обновляем статус заказа
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning()

    if (!updatedOrder) {
      return NextResponse.json({ 
        error: 'Order not found' 
      }, { status: 404 })
    }

    // Отправляем уведомление об изменении статуса
    await sendOrderStatusUpdate(
      updatedOrder.id,
      status,
      updatedOrder.customer_name
    )

    return NextResponse.json(updatedOrder)

  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
