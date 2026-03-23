import { Breadcrumb } from '@/components/ui/breadcrumb';
import { VideoReviewsSection } from '@/components/sections/video-reviews-section';
import { ConsultationCTA } from '@/components/consultation-cta';
import { AboutHeroSection } from '@/components/sections/about-hero-section';
import { CompanyStorySection } from '@/components/sections/company-story-section';
import { AdvantagesSection } from '@/components/sections/advantages-section';
import { Metadata } from 'next';
import { getVideoReviews } from '@/lib/page-data';

export const metadata: Metadata = {
  title:
    'СалютГрад - Фейерверки и салюты в Москве и МО | Безопасный запуск салюта на свадьбу и праздник',
  description:
    '🔥 Качественные фейерверки в Москве и Московской области! Безопасный запуск салютов, доставка по МО, самовывоз в Балашихе. 500+ довольных клиентов, гарантия качества, лицензированная пиротехника. Закажите салют прямо сейчас!',
  keywords:
    'фейерверки москва, салюты москва, фейерверки московская область, салюты московская область, салют на свадьбу, салют на день рождения, безопасный запуск салютов, доставка пиротехники москва, самовывоз балашиха, качественные фейерверки, лицензированная пиротехника, салют на заказ',
  openGraph: {
    title: 'СалютГрад - Фейерверки и салюты в Москве и МО | Безопасный запуск салюта на свадьбу и праздник',
    description:
      '🔥 Качественные фейерверки в Москве и Московской области! Безопасный запуск салютов, доставка по МО, самовывоз в Балашихе. 500+ довольных клиентов, гарантия качества.',
    type: 'website',
    locale: 'ru_RU',
  },
  alternates: {
    canonical: 'https://salutgrad.ru/about/',
  },
};

export default async function AboutPage() {
  const videoReviews = (await getVideoReviews()) as any[];

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
            url: 'https://salutgrad.ru/about',
            email: 'info@salutgrad.ru',
            telephone: '+7 (977) 360-20-08',
            foundingDate: '2020',
            areaServed: 'RU',
            serviceArea: {
              '@type': 'GeoCircle',
              geoMidpoint: {
                '@type': 'GeoCoordinates',
                latitude: '55.744657',
                longitude: '38.050318'
              },
              geoRadius: '50000'
            },
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'RU',
              addressRegion: 'Московская область',
              addressLocality: 'Балашиха',
              streetAddress: 'улица Агрогородок, вл31',
              postalCode: '143921'
            },
            sameAs: [
              'https://salutgrad.ru',
              'https://salutgrad.ru/catalog',
              'https://salutgrad.ru/delivery'
            ]
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
