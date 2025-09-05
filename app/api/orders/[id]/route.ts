import { db } from '@/lib/db';
import { orders, orderItems, completedOrders, completedOrderItems, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get the order
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));

    if (!order) {
      return NextResponse.json({
        error: 'Order not found'
      }, { status: 404 });
    }

    // Get order items with product information
    const orderItemsData = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        price_at_time: orderItems.price_at_time,
        product_id: orderItems.product_id,
        product: {
          id: products.id,
          name: products.name,
          images: products.images,
          price: products.price,
        }
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.product_id, products.id))
      .where(eq(orderItems.order_id, id));

    const orderWithItems = {
      ...order,
      items: orderItemsData
    };

    return NextResponse.json(orderWithItems);

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await request.json();
  const { status, items, ...orderUpdateData } = body;

  console.log('PATCH request data:', { id, status, items, orderUpdateData });

  try {
    if (status === 'completed') {
      // Create a completed order record instead of modifying the original
      const [completedOrder] = await db
        .insert(completedOrders)
        .values({
          original_order_id: id,
          final_customer_name: orderUpdateData.customer_name,
          final_customer_phone: orderUpdateData.customer_phone,
          final_customer_contact: orderUpdateData.customer_contact || null,
          final_contact_method: orderUpdateData.contact_method || null,
          final_delivery_method: orderUpdateData.delivery_method,
          final_delivery_cost: Number(orderUpdateData.delivery_cost || 0),
          final_discount_amount: Number(orderUpdateData.discount_amount || 0),
          final_total_amount: Number(orderUpdateData.total_amount),
          has_manual_discount: Boolean(orderUpdateData.has_discount), // Map has_discount to has_manual_discount
          admin_comment: orderUpdateData.comment || null,
          // TODO: Add completed_by from authenticated admin user
        })
        .returning();

      // Insert completed order items
      if (items && Array.isArray(items) && items.length > 0) {
        console.log('Raw items received:', items);

        const completedOrderItemsData = items.map(item => {
          console.log('Processing item:', item);
          return {
            completed_order_id: completedOrder.id,
            product_id: item.product_id || item.product?.id, // Handle both possible structures
            final_quantity: Number(item.quantity),
            final_price_at_time: Number(item.price_at_time),
          };
        });

        console.log('Inserting completed order items:', completedOrderItemsData);
        await db.insert(completedOrderItems).values(completedOrderItemsData);
      }

      // Update original order status only
      const [updatedOrder] = await db
        .update(orders)
        .set({
          status: 'completed',
          updated_at: new Date(),
        })
        .where(eq(orders.id, id))
        .returning();

      console.log('Order completed successfully:', updatedOrder);
      return NextResponse.json({
        ...updatedOrder,
        completedOrderId: completedOrder.id,
      });

    } else {
      // For non-completed status updates, just update the status
      const updateData: any = {
        status,
        updated_at: new Date(),
      };

      const [updatedOrder] = await db
        .update(orders)
        .set(updateData)
        .where(eq(orders.id, id))
        .returning();

      if (!updatedOrder) {
        return new NextResponse('Order not found', { status: 404 });
      }

      console.log('Order status updated:', updatedOrder);
      return NextResponse.json(updatedOrder);
    }
  } catch (error) {
    console.error('Error updating order:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      orderUpdateData,
      items,
      id
    });
    return new NextResponse(`Internal Server Error: ${errorMessage}`, { status: 500 });
  }
}

