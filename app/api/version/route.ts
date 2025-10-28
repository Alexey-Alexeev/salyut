import { NextResponse } from 'next/server';

export async function GET() {
  // Используем переменную окружения или фиксированную версию для локальной разработки
  const version = process.env.SITE_VERSION || 'local-dev';
  const buildId = process.env.BUILD_ID || 'local-build';
  
  return NextResponse.json(
    { 
      version,
      timestamp: new Date().toISOString(),
      buildId
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
