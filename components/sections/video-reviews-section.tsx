import { VideoReviewCard } from '@/components/video-review-card';

interface VideoReview {
    id: string;
    customer_name: string;
    video_url: string;
    thumbnail_url?: string;
}

interface VideoReviewsSectionProps {
    videoReviews: VideoReview[];
    title?: string;
    description?: string;
    className?: string;
}

export function VideoReviewsSection({
    videoReviews,
    title = "Наши салюты в действии",
    description = "Посмотрите, как выглядит наш товар на реальных праздниках клиентов",
    className = ""
}: VideoReviewsSectionProps) {
    return (
        <section className={`bg-muted py-16 ${className}`}>
            <div className="container mx-auto px-4">
                <div className="mb-12 space-y-4 text-center">
                    <h2 className="text-3xl font-bold md:text-4xl">
                        {title}
                    </h2>
                    <p className="mx-auto max-w-2xl text-gray-800">
                        {description}
                    </p>
                </div>

                {videoReviews.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {videoReviews.map(video => (
                            <VideoReviewCard key={video.id} video={video} />
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <p className="text-muted-foreground">
                            Видео отзывы скоро появятся
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
