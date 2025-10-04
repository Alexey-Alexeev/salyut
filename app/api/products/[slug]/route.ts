import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories, manufacturers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const decodedSlug = decodeURIComponent(params.slug);

    // Сначала проверим, есть ли товары вообще
    const allProducts = await db
      .select({ slug: products.slug, name: products.name })
      .from(products);

    // Ищем товар по slug
    const product = await db
      .select()
      .from(products)
      .where(eq(products.slug, decodedSlug))
      .limit(1);

    if (!product[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const productData = product[0];

    // Загружаем связанные данные
    let categoryData = null;
    let manufacturerData = null;

    if (productData.category_id) {
      try {
        const category = await db
          .select()
          .from(categories)
          .where(eq(categories.id, productData.category_id))
          .limit(1);
        categoryData = category[0] || null;
      } catch (error) {
        console.error('Error loading category:', error);
      }
    }

    if (productData.manufacturer_id) {
      try {
        const manufacturer = await db
          .select()
          .from(manufacturers)
          .where(eq(manufacturers.id, productData.manufacturer_id))
          .limit(1);
        manufacturerData = manufacturer[0] || null;
      } catch (error) {
        console.error('Error loading manufacturer:', error);
      }
    }

    return NextResponse.json({
      product: productData,
      category: categoryData,
      manufacturer: manufacturerData,
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
