// app/api/telegram/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { telegramBot } from '@/lib/telegram-bot'

export async function POST(request: NextRequest) {
  try {
    const update = await request.json()
    
    // Handle bot commands
    if (update.message) {
      await telegramBot.handleUpdate(update)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  // Verify webhook token for security (optional)
  // const authHeader = request.headers.get('authorization')
  // const expectedToken = process.env.TELEGRAM_WEBHOOK_SECRET
  // if (authHeader !== `Bearer ${expectedToken}`) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // }
}