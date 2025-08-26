import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { db } from '@/lib/db'
import { reviews } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export default async function ReviewsPage() {
  let videoReviews: any[] = []

  try {
    videoReviews = await db.select().from(reviews).where(eq(reviews.is_approved, true)).orderBy(desc(reviews.sort_order))
  } catch (error) {
    console.error('Error loading reviews:', error)
    // Fallback данные для отзывов
    videoReviews = [
      {
        id: '1',
        customer_name: 'Алексей М.',
        video_url: 'https://images.pexels.com/photos/1387178/pexels-photo-1387178.jpeg?auto=compress&cs=tinysrgb&w=600'
      },
      {
        id: '2', 
        customer_name: 'Марина К.',
        video_url: 'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=600'
      },
      {
        id: '3',
        customer_name: 'Дмитрий Л.',
        video_url: 'https://images.pexels.com/photos/1387172/pexels-photo-1387172.jpeg?auto=compress&cs=tinysrgb&w=600'
      }
    ]
  }
  console.log('videoReviews', videoReviews)
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb
            items={[
              { label: 'Отзывы' }
            ]}
        />
      </div>


      <div className="text-center space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold">Наши фейерверки в действии</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Посмотрите, как выглядят наши фейерверки на реальных праздниках наших клиентов
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoReviews.map((video) => (
          <Card key={video.id} className="overflow-hidden group cursor-pointer">
            <div className="aspect-video relative">
              <Image
                src={video.video_url || 'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=600'}
                alt={video.customer_name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Отзыв от {video.customer_name}</h3>
              <p className="text-sm text-muted-foreground">Видео отзыв</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {videoReviews.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Пока нет отзывов. Будьте первым!
          </p>
        </div>
      )}
    </div>
  )
}
