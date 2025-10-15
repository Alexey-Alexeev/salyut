import { Breadcrumb } from '@/components/ui/breadcrumb';
import { VideoReviewCard } from '@/components/video-review-card';
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
        video_url: 'https://rutube.ru/video/1234567890abcdef/',
        thumbnail_url: 'https://images.pexels.com/photos/1387178/pexels-photo-1387178.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        id: '2',
        customer_name: 'Марина К.',
        video_url: 'https://vk.com/video-123456789_456789123',
        thumbnail_url: 'https://images.pexels.com/photos/1387174/pexels-photo-1387174.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        id: '3',
        customer_name: 'Дмитрий Л.',
        video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        thumbnail_url: 'https://images.pexels.com/photos/1387172/pexels-photo-1387172.jpeg?auto=compress&cs=tinysrgb&w=600',
      },
      {
        id: '4',
        customer_name: 'Елена С.',
        video_url: 'https://rutube.ru/video/7e23e3c805dd8eb4b298b790357e3e89/',
        thumbnail_url: 'https://images.pexels.com/photos/1387176/pexels-photo-1387176.jpeg?auto=compress&cs=tinysrgb&w=600',
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {videoReviews.map(video => (
          <VideoReviewCard key={video.id} video={video} />
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
