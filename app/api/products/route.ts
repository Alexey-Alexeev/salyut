import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const productsData = await db
      .select()
      .from(products)
      .where(eq(products.is_active, true))
    
    return NextResponse.json(productsData)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
