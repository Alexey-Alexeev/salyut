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
        className="relative min-h-[70vh] flex items-center justify-center overflow-hidden"
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

        <div className="relative z-10 text-center text-white space-y-6 px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white bg-black/40 p-4 rounded-lg">
            О нашей <span className="text-orange-400">компании</span>
          </h1>
          <p className="text-lg md:text-xl text-white bg-black/30 p-4 rounded-lg max-w-3xl mx-auto">
            Мы предлагаем качественную пиротехнику от лучших импортных
            производителей, создавая незабываемые праздники
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section
        className="container mx-auto px-4 mt-16 mb-16"
        itemScope
        itemType="https://schema.org/Organization"
      >
        <div className="max-w-4xl mx-auto space-y-12">
          <header className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Наша история</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Мы начали свой путь с простой идеи — делать праздники ярче и
              незабываемее
            </p>
          </header>

          <article className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
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
            <figure className="aspect-video relative rounded-lg overflow-hidden">
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
        className="container mx-auto px-4 mb-16"
        aria-labelledby="advantages-heading"
      >
        <header className="text-center space-y-4 mb-12">
          <h2
            id="advantages-heading"
            className="text-3xl md:text-4xl font-bold"
          >
            Наши преимущества
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Почему клиенты выбирают именно нас
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
          <article className="text-center" role="listitem">
            <Card>
              <CardContent className="p-6 space-y-4">
                <Shield
                  className="h-16 w-16 text-orange-500 mx-auto"
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
              <CardContent className="p-6 space-y-4">
                <Heart
                  className="h-16 w-16 text-orange-500 mx-auto"
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
              <CardContent className="p-6 space-y-4">
                <Award
                  className="h-16 w-16 text-orange-500 mx-auto"
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
          <header className="text-center space-y-4 mb-12">
            <h2 id="reviews-heading" className="text-3xl md:text-4xl font-bold">
              Отзывы наших клиентов
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Смотрите, что говорят о нас наши покупатели и как выглядят наши
              фейерверки на их праздниках
            </p>
          </header>

          {videoReviews.length > 0 ? (
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              role="list"
            >
              {videoReviews.map(video => (
                <div key={video.id} role="listitem">
                  <VideoReviewCard video={video} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
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
