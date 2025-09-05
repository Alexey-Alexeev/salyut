import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { VideoReviewCard } from '@/components/video-review-card';
import { ConsultationCTA } from '@/components/consultation-cta';
import { db } from '@/lib/db';
import { reviews } from '@/db/schema';
import { Shield, Heart, Award } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'О нас - Качественная пиротехника от лучших импортных производителей | КупитьСалюты',
  description:
    'Узнайте о нашей компании: работаем с ведущими зарубежными производителями пиротехники, предлагаем качественные фейерверки и салюты с гарантией безопасности.',
  keywords:
    'о компании, импортная пиротехника, качественные фейерверки, зарубежные производители, салюты, безопасность',
  openGraph: {
    title: 'О нас - Качественная пиротехника от импортных производителей',
    description:
      'Работаем с ведущими зарубежными производителями пиротехники. Качественные фейерверки и салюты с гарантией безопасности.',
    type: 'website',
    locale: 'ru_RU',
  },
  alternates: {
    canonical: '/about',
  },
};

export default async function AboutPage() {
  // Загружаем видео отзывы
  let videoReviews: any[] = [];

  try {
    videoReviews = await db.select().from(reviews).limit(6);
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
            name: 'КупитьСалюты',
            description:
              'Качественная пиротехника от лучших импортных производителей',
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
            Мы предлагаем качественную пиротехнику от лучших импортных
            производителей, создавая незабываемые праздники
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section
        className="container mx-auto my-16 px-4"
        itemScope
        itemType="https://schema.org/Organization"
      >
        <div className="mx-auto max-w-4xl space-y-12">
          <header className="space-y-4 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Наша история</h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              Мы начали свой путь с простой идеи — делать праздники ярче и
              незабываемее
            </p>
          </header>

          <article className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">
                Импортные поставщики высшего класса
              </h3>
              <p className="text-muted-foreground" itemProp="description">
                Мы работаем исключительно с ведущими зарубежными производителями
                пиротехники. Наши импортные поставщики используют передовые
                технологии и высококачественные материалы, что гарантирует
                яркие, безопасные и незабываемые фейерверки.
              </p>
              <p className="text-muted-foreground">
                Каждый товар в нашем ассортименте проходит строгий контроль
                качества и имеет все необходимые сертификаты. Мы гордимся тем,
                что предлагаем только проверенную продукцию от надежных
                международных брендов, которые зарекомендовали себя на мировом
                рынке пиротехники.
              </p>
            </div>
            <figure className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src="../../images/hero-bg3.webp"
                alt="Качественные фейерверки и салюты от импортных производителей"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </figure>
          </article>
        </div>
      </section>

      {/* Our Advantages */}
      <section
        className="container mx-auto mb-16 px-4"
        aria-labelledby="advantages-heading"
      >
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
          <article className="text-center" role="listitem">
            <Card>
              <CardContent className="space-y-4 p-6">
                <Shield
                  className="mx-auto size-16 text-orange-500"
                  aria-hidden="true"
                />
                <h3 className="text-xl font-semibold">Импортные поставщики</h3>
                <p className="text-muted-foreground">
                  Работаем исключительно с ведущими зарубежными производителями,
                  которые используют передовые технологии и высококачественные
                  материалы
                </p>
              </CardContent>
            </Card>
          </article>
          <article className="text-center" role="listitem">
            <Card>
              <CardContent className="space-y-4 p-6">
                <Heart
                  className="mx-auto size-16 text-orange-500"
                  aria-hidden="true"
                />
                <h3 className="text-xl font-semibold">Довольные клиенты</h3>
                <p className="text-muted-foreground">
                  Тысячи положительных отзывов и высокие оценки от наших
                  покупателей — лучшее подтверждение качества
                </p>
              </CardContent>
            </Card>
          </article>
          <article className="text-center" role="listitem">
            <Card>
              <CardContent className="space-y-4 p-6">
                <Award
                  className="mx-auto size-16 text-orange-500"
                  aria-hidden="true"
                />
                <h3 className="text-xl font-semibold">Экспертная поддержка</h3>
                <p className="text-muted-foreground">
                  Наши специалисты помогут выбрать подходящие фейерверки и
                  ответят на все ваши вопросы
                </p>
              </CardContent>
            </Card>
          </article>
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
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
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
