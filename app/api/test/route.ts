// app/api/test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, products, categories } from '@/db/schema';
import { count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {

    // Проверяем переменные окружения
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
      TELEGRAM_CHAT_ID: !!process.env.TELEGRAM_CHAT_ID,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };


    // Проверяем подключение к базе данных
    let dbStatus = 'disconnected';
    let tablesInfo = {};

    try {
      // Проверяем количество записей в каждой таблице
      const [ordersCount] = await db.select({ count: count() }).from(orders);
      const [productsCount] = await db
        .select({ count: count() })
        .from(products);
      const [categoriesCount] = await db
        .select({ count: count() })
        .from(categories);

      dbStatus = 'connected';
      tablesInfo = {
        orders: ordersCount.count,
        products: productsCount.count,
        categories: categoriesCount.count,
      };

    } catch (dbError) {
      console.error('❌ Ошибка базы данных:', dbError);
      dbStatus = `error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`;
    }

    // Проверяем Telegram
    let telegramStatus = 'not_configured';
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      try {
        const response = await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`
        );
        if (response.ok) {
          const botInfo = await response.json();
          telegramStatus = `connected: @${botInfo.result.username}`;
        } else {
          telegramStatus = 'invalid_token';
        }
      } catch (telegramError) {
        telegramStatus = 'connection_error';
      }
    }


    return NextResponse.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      database: {
        status: dbStatus,
        tables: tablesInfo,
      },
      telegram: telegramStatus,
      message: 'Диагностика завершена успешно',
    });
  } catch (error) {
    console.error('❌ Ошибка диагностики:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Диагностика завершилась с ошибкой',
      },
      { status: 500 }
    );
  }
}
