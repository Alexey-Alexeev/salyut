import { Breadcrumb } from '@/components/ui/breadcrumb';
import { VideoReviewsSection } from '@/components/sections/video-reviews-section';
import { ConsultationCTA } from '@/components/consultation-cta';
import { AboutHeroSection } from '@/components/sections/about-hero-section';
import { CompanyStorySection } from '@/components/sections/company-story-section';
import { AdvantagesSection } from '@/components/sections/advantages-section';
import { db } from '@/lib/db';
import { reviews } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'О нас - Качественная пиротехника с гарантией безопасности',
  description:
    'Узнайте о нашей компании: профессиональный запуск салютов, доставка по Москве и МО, самовывоз в Балашихе. Качественные фейерверки с гарантией безопасности.',
  keywords:
    'о компании, профессиональный запуск салютов, доставка пиротехники москва, самовывоз балашиха, качественные фейерверки, безопасность',
  openGraph: {
    title: 'О нас - Качественная пиротехника с гарантией безопасности',
    description:
      'Профессиональный запуск салютов, доставка по Москве и МО, самовывоз в Балашихе. Качественные фейерверки с гарантией безопасности.',
    type: 'website',
    locale: 'ru_RU',
  },
  alternates: {
    canonical: 'https://salutgrad.ru/about',
  },
};

export default async function AboutPage() {
  // Загружаем видео отзывы
  let videoReviews: any[] = [];

  try {
    videoReviews = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.created_at))
      .limit(8);
  } catch (error) {
    console.error('Error loading reviews:', error);
  }

  return (
    <div>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'СалютГрад',
            description:
              'Качественная пиротехника с гарантией безопасности и профессиональным запуском',
            url: 'https://your-domain.com/about',
            foundingDate: '2020',
            areaServed: 'RU',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Пиротехника и фейерверки',
              itemListElement: [
                {
                  '@type': 'Offer',
                  itemOffered: {
                    '@type': 'Product',
                    name: 'Фейерверки и салюты',
                    category: 'Пиротехника',
                  },
                },
              ],
            },
          }),
        }}
      />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[{ label: 'О нас' }]} />
      </div>

      <AboutHeroSection />

      <CompanyStorySection />

      <AdvantagesSection />

      <VideoReviewsSection
        videoReviews={videoReviews}
        title="Отзывы наших клиентов"
        description="Смотрите, что говорят о нас наши покупатели и как выглядят наши фейерверки на их праздниках"
      />

      {/* CTA Section */}
      <ConsultationCTA className="py-8 md:py-16" />
    </div>
  );
}
