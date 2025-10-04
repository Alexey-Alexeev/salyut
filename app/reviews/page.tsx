import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { db } from '@/lib/db';
import { reviews } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export default async function ReviewsPage() {
  let videoReviews: any[] = [];

  try {
    videoReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.is_approved, true))
      .orderBy(desc(reviews.sort_order));
  } catch (error) {
    console.error('Error loading reviews:', error);
    // Fallback данные для отзывов
    videoReviews = [
      {
        id: '1',
        customer_name: 'Алексей М.',
        video_url:
          'https://images.pexels.com/photos/1387178/pexels-photo-1387178.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        id: '2',
        customer_name: 'Марина К.',
        video_url:
          'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        id: '3',
        customer_name: 'Дмитрий Л.',
        video_url:
          'https://images.pexels.com/photos/1387172/pexels-photo-1387172.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
    ];
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb items={[{ label: 'Отзывы' }]} />
      </div>

      <div className="mb-12 space-y-4 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          Наши фейерверки в действии
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Посмотрите, как выглядят наши фейерверки на реальных праздниках наших
          клиентов
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videoReviews.map(video => (
          <Card key={video.id} className="group cursor-pointer overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={
                  video.video_url ||
                  'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=600'
                }
                alt={video.customer_name}
                fill
                className="object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/20">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <div className="ml-1 size-0 border-y-[8px] border-l-[12px] border-y-transparent border-l-white" />
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold">
                Отзыв от {video.customer_name}
              </h3>
              <p className="text-muted-foreground text-sm">Видео отзыв</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {videoReviews.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            Пока нет отзывов. Будьте первым!
          </p>
        </div>
      )}
    </div>
  );
}
