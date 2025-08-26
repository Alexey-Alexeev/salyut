import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products, categories, manufacturers } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const product = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        images: products.images,
        description: products.description,
        characteristics: products.characteristics,
        is_popular: products.is_popular,
        is_active: products.is_active,
        stock_quantity: products.stock_quantity,
        created_at: products.created_at,
        category: {
          id: categories.id,
          name: categories.name,
          slug: categories.slug,
        },
        manufacturer: {
          id: manufacturers.id,
          name: manufacturers.name,
          country: manufacturers.country,
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.category_id, categories.id))
      .leftJoin(manufacturers, eq(products.manufacturer_id, manufacturers.id))
      .where(eq(products.slug, slug))
      .single()

    if (!product) {
      return NextResponse.json({ 
        error: 'Product not found' 
      }, { status: 404 })
    }

    if (!product.is_active) {
      return NextResponse.json({ 
        error: 'Product is not available' 
      }, { status: 404 })
    }

    // Форматируем данные для фронтенда
    const formattedProduct = {
      ...product,
      price: product.price / 100, // Конвертируем из копеек в рубли
      formattedPrice: (product.price / 100).toLocaleString('ru-RU'),
      mainImage: product.images?.[0] || null,
    }

    return NextResponse.json(formattedProduct)

  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
