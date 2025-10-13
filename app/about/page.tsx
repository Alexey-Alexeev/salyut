import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { VideoReviewCard } from '@/components/video-review-card';
import { ConsultationCTA } from '@/components/consultation-cta';
import { db } from '@/lib/db';
import { reviews } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { Shield, Heart, Award } from 'lucide-react';
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
    canonical: 'https://салютград.рф/about',
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

      {/* Hero Section */}
      <section
        className="relative flex min-h-[70vh] items-center justify-center overflow-hidden"
        role="banner"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src="../../images/hero-bg2.webp"
            alt="О компании - качественные фейерверки и салюты"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            placeholder="blur"
            blurDataURL="../../images/hero-bg2.webp"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl space-y-6 px-4 text-center text-white">
          <h1 className="rounded-lg bg-black/40 p-4 text-4xl font-bold leading-tight text-white md:text-6xl">
            О нашей <span className="text-orange-400">компании</span>
          </h1>
          <p className="mx-auto max-w-3xl rounded-lg bg-black/30 p-4 text-lg text-white md:text-xl">
            Мы предлагаем качественную пиротехнику с гарантией безопасности,
            создавая незабываемые праздники для вас и ваших близких
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section
        className="bg-gradient-to-br from-orange-50 to-red-50 py-16"
        itemScope
        itemType="https://schema.org/Organization"
      >
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold md:text-4xl">Наша история</h2>
                  <p className="text-muted-foreground text-lg">
                    Мы начали свой путь с простой идеи — делать праздники ярче и
                    незабываемее
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold">Наша миссия</h3>
                  <p className="text-muted-foreground" itemProp="description">
                    Мы гарантируем полную безопасность каждого фейерверка. Все товары
                    проходят строгий контроль качества и имеют необходимые сертификаты.
                    Наша продукция соответствует всем требованиям безопасности и
                    обеспечивает яркие, незабываемые впечатления.
                  </p>
                  <p className="text-muted-foreground">
                    Каждый товар в нашем ассортименте тщательно отобран и проверен.
                    Мы гордимся тем, что предлагаем только качественную продукцию,
                    которая подарит вам и вашим близким незабываемые моменты радости
                    и восторга.
                  </p>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">
                <figure className="relative w-full max-w-md aspect-video overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src="../../images/hero-bg3.webp"
                    alt="Качественные фейерверки и салюты с гарантией безопасности"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Advantages */}
      <section
        className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16"
        aria-labelledby="advantages-heading"
      >
        <div className="container mx-auto px-4">
          <header className="mb-12 space-y-4 text-center">
            <h2
              id="advantages-heading"
              className="text-3xl font-bold md:text-4xl"
            >
              Наши преимущества
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Почему клиенты выбирают именно нас
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3" role="list">
            <article className="text-center h-full" role="listitem">
              <Card className="h-full">
                <CardContent className="flex flex-col space-y-4 p-6 h-full">
                  <Shield
                    className="mx-auto size-16 text-orange-500"
                    aria-hidden="true"
                  />
                  <h3 className="text-xl font-semibold">Профессиональный запуск</h3>
                  <p className="text-muted-foreground flex-grow">
                    Доверьте запуск профессионалам! Мы обеспечим полную безопасность,
                    соблюдение всех норм и незабываемое шоу. Не рискуйте — оставьте всё профессионалам!
                  </p>
                </CardContent>
              </Card>
            </article>
            <article className="text-center h-full" role="listitem">
              <Card className="h-full">
                <CardContent className="flex flex-col space-y-4 p-6 h-full">
                  <Heart
                    className="mx-auto size-16 text-orange-500"
                    aria-hidden="true"
                  />
                  <h3 className="text-xl font-semibold">Доставка по Москве и МО</h3>
                  <p className="text-muted-foreground flex-grow">
                    Быстрая и надежная доставка по всей Москве и Московской области.
                    Также доступен самовывоз в Балашихе. Удобно, быстро, безопасно!
                  </p>
                </CardContent>
              </Card>
            </article>
            <article className="text-center h-full" role="listitem">
              <Card className="h-full">
                <CardContent className="flex flex-col space-y-4 p-6 h-full">
                  <Award
                    className="mx-auto size-16 text-orange-500"
                    aria-hidden="true"
                  />
                  <h3 className="text-xl font-semibold">Гарантия качества</h3>
                  <p className="text-muted-foreground flex-grow">
                    Все товары проходят строгий контроль качества и имеют
                    необходимые сертификаты безопасности. Десятки довольных клиентов —
                    лучшее подтверждение нашего качества!
                  </p>
                </CardContent>
              </Card>
            </article>
          </div>
        </div>
      </section>

      {/* Video Reviews */}
      <section className="bg-muted py-16" aria-labelledby="reviews-heading">
        <div className="container mx-auto px-4">
          <header className="mb-12 space-y-4 text-center">
            <h2 id="reviews-heading" className="text-3xl font-bold md:text-4xl">
              Отзывы наших клиентов
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              Смотрите, что говорят о нас наши покупатели и как выглядят наши
              фейерверки на их праздниках
            </p>
          </header>

          {videoReviews.length > 0 ? (
            <div
              className="grid grid-cols-1 gap-6 sm:grid-cols-2"
              role="list"
            >
              {videoReviews.map(video => (
                <div key={video.id} role="listitem">
                  <VideoReviewCard video={video} />
                </div>
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

      {/* CTA Section */}
      <ConsultationCTA className="py-8 md:py-16" />
    </div>
  );
}
