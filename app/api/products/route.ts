import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    console.log('Loading products for catalog...')
    
    const productsData = await db
      .select()
      .from(products)
      .where(eq(products.is_active, true))
    
    console.log('Found products:', productsData.map(p => ({ id: p.id, name: p.name, slug: p.slug })))
    
    return NextResponse.json(productsData)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
