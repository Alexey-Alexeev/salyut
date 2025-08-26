import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { categories } from '@/db/schema'

export async function GET() {
  try {
    const categoriesData = await db.select().from(categories)
    return NextResponse.json(categoriesData)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
