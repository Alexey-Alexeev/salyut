import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { consultations } from '@/db/schema'
import { sendConsultationNotification } from '@/lib/telegram'
import { z } from 'zod'
import { eq, desc } from 'drizzle-orm'

// Схема валидации для заявки на консультацию
const consultationSchema = z.object({
    name: z.string().min(1, 'Имя обязательно').trim(),
    contactMethod: z.enum(['phone', 'telegram', 'whatsapp'], {
        required_error: 'Выберите способ связи'
    }),
    contactInfo: z.string().min(1, 'Контактная информация обязательна').trim(),
    message: z.string().optional(),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Валидация данных
        const validatedData = consultationSchema.parse(body)

        // Создание записи в базе данных
        const [consultation] = await db
            .insert(consultations)
            .values({
                name: validatedData.name,
                contact_method: validatedData.contactMethod,
                contact_info: validatedData.contactInfo,
                message: validatedData.message || null,
                status: 'new',
            })
            .returning()

        // Отправка уведомления в Telegram
        await sendConsultationNotification({
            consultationId: consultation.id,
            name: consultation.name,
            contactMethod: consultation.contact_method as 'phone' | 'telegram' | 'whatsapp',
            contactInfo: consultation.contact_info,
            message: consultation.message || undefined,
        })

        return NextResponse.json({
            success: true,
            data: {
                id: consultation.id,
                status: consultation.status,
                created_at: consultation.created_at,
            }
        })

    } catch (error) {
        console.error('Error creating consultation:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    details: error.errors.map(err => err.message).join(', ')
                },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error'
            },
            { status: 500 }
        )
    }
}

// GET endpoint для получения консультаций (для админки в будущем)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')

        let query = db.select().from(consultations)

        if (status && ['new', 'contacted', 'completed'].includes(status)) {
            query = query.where(eq(consultations.status, status as any))
        }

        const results = await query
            .orderBy(desc(consultations.created_at))
            .limit(limit)
            .offset(offset)

        return NextResponse.json({
            success: true,
            data: results,
            pagination: {
                limit,
                offset,
                total: results.length
            }
        })

    } catch (error) {
        console.error('Error fetching consultations:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error'
            },
            { status: 500 }
        )
    }
}