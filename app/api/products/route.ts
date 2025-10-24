import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/db/schema';
import { submitProductUrl } from '@/lib/indexnow';

/**
 * API для управления товарами
 * POST /api/products - создать товар
 * GET /api/products - получить список товаров
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, price, category_id, description, images } = body;

    // Создаем товар в базе данных
    const [newProduct] = await db.insert(products).values({
      name,
      slug,
      price,
      category_id,
      description,
      images,
      is_active: true,
    }).returning();

    // 🚀 АВТОМАТИЧЕСКАЯ ОТПРАВКА В YANDEX ЧЕРЕЗ INDEXNOW
    try {
      const indexNowResult = await submitProductUrl(slug);
      
      if (indexNowResult.success) {
        console.log(`✅ Товар ${slug} отправлен в Яндекс для индексации`);
      } else {
        console.log(`⚠️ Ошибка отправки в Яндекс: ${indexNowResult.message}`);
      }
    } catch (error) {
      console.error('❌ Ошибка IndexNow:', error);
      // Не прерываем создание товара из-за ошибки IndexNow
    }

    return NextResponse.json({
      success: true,
      product: newProduct,
      indexNow: {
        sent: true,
        message: 'Товар отправлен в Яндекс для индексации'
      }
    });

  } catch (error) {
    console.error('Ошибка создания товара:', error);
    return NextResponse.json({
      success: false,
      error: 'Ошибка создания товара'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allProducts = await db.select().from(products);
    return NextResponse.json(allProducts);
  } catch (error) {
    return NextResponse.json({
      error: 'Ошибка получения товаров'
    }, { status: 500 });
  }
}
