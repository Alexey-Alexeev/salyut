import { NextRequest, NextResponse } from 'next/server';
import { submitSingleUrl, submitMultipleUrls, submitMainPages } from '@/lib/indexnow';

/**
 * API endpoint для отправки URL в Яндекс через IndexNow
 * 
 * GET /api/indexnow?url=https://example.com/page - отправить один URL
 * POST /api/indexnow - отправить несколько URL
 * GET /api/indexnow/main - отправить основные страницы сайта
 */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const action = searchParams.get('action');

  // Отправка основных страниц
  if (action === 'main') {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://salutgrad.ru';
    const result = await submitMainPages(baseUrl);
    
    return NextResponse.json(result);
  }

  // Отправка одного URL
  if (url) {
    const result = await submitSingleUrl(url);
    return NextResponse.json(result);
  }

  return NextResponse.json({
    success: false,
    status: 400,
    message: 'Необходимо указать параметр url или action=main'
  }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls, host } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({
        success: false,
        status: 400,
        message: 'Необходимо передать массив URL в поле urls'
      }, { status: 400 });
    }

    const result = await submitMultipleUrls(urls, host);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 400,
      message: 'Неверный формат JSON'
    }, { status: 400 });
  }
}

