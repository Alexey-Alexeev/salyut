'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConsultationDialog } from '@/components/consultation-dialog';
import { VideoReviewsSection } from '@/components/sections/video-reviews-section';
import { ServicesHeroSection } from '@/components/sections/services-hero-section';
import { FactsSection } from '@/components/sections/facts-section';
import { BenefitsSection } from '@/components/sections/benefits-section';
import { ProcessSection } from '@/components/sections/process-section';
import { ServicesCTASection } from '@/components/sections/services-cta-section';

interface VideoReview {
  id: string;
  customer_name: string;
  video_url: string;
  thumbnail_url?: string;
}

interface LaunchingServicePageProps {
  videoReviews: VideoReview[];
}

export default function LaunchingServicePage({ videoReviews }: LaunchingServicePageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const faqItems = [
    {
      question: 'Какой салют лучше для свадьбы?',
      answer:
        'Обычно выбирают среднюю или высокую мощность с финальным залпом. Мы подберём варианты по бюджету, площадке и таймингу (вынос торта/финал).',
    },
    {
      question: 'Можно ли синхронизировать запуск с программой и музыкой?',
      answer:
        'Да. Согласуем время запуска и формат финала заранее и при необходимости координируем с ведущим/организатором.',
    },
    {
      question: 'Можно ли устроить небольшой салют на день рождения?',
      answer:
        'Да. Подберём компактные батареи и безопасный сценарий под двор, дачу или частный дом: дистанции, направление и длительность шоу.',
    },
    {
      question: 'Вы помогаете оценить площадку и безопасные расстояния?',
      answer:
        'Да. Перед запуском уточняем место и условия, подсказываем безопасные зоны для зрителей и требования к площадке.',
    },
    {
      question: 'Подходит ли услуга запуска для корпоратива или базы отдыха?',
      answer:
        'Да. Согласуем формат запуска, логистику и требования безопасности для гостей и площадки. Подберём сценарий под мероприятие и бюджет.',
    },
    {
      question: 'Где посмотреть условия доставки и самовывоза пиротехники?',
      answer:
        'Подробные условия доставки и самовывоза смотрите на странице https://salutgrad.ru/delivery/.',
    },
  ] as const;

  return (
    <div className="min-h-screen">
      <ServicesHeroSection onConsultationClick={() => setIsDialogOpen(true)} />

      <section className="container mx-auto px-4 pt-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Организация запуска под ваш праздник
          </h2>
          <p className="text-sm text-gray-700">
            Быстрые переходы: {' '}
            <Link href="#wedding" className="font-medium text-orange-700 underline hover:text-orange-900">
              на свадьбу
            </Link>
            {' • '}
            <Link href="#birthday" className="font-medium text-orange-700 underline hover:text-orange-900">
              на день рождения
            </Link>
            {' • '}
            <Link href="#corporate" className="font-medium text-orange-700 underline hover:text-orange-900">
              на корпоратив
            </Link>
          </p>
        </div>
      </section>

      <FactsSection />

      <BenefitsSection />

      <ProcessSection />

      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article id="wedding" className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Запуск салюта на свадьбу
            </h2>
            <p className="text-sm text-gray-700">
              Подстраиваем шоу под тайминг вечера: вынос торта, финал, музыкальная пауза. Помогаем выбрать
              пиротехнику под площадку и согласовать безопасные зоны.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>— Подбор салюта под локацию и формат праздника</li>
              <li>— Координация с ведущим/организатором</li>
              <li>— Контроль безопасности и соблюдение требований</li>
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="rounded-md bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800"
              >
                Рассчитать запуск
              </button>
              <Link href="/catalog" className="text-sm font-medium text-orange-700 underline hover:text-orange-900">
                Подобрать салют в каталоге
              </Link>
            </div>
            <div className="mt-5 rounded-lg bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Частые вопросы</h3>
              <p className="mt-2 text-sm text-gray-700">
                Какой салют лучше для свадьбы? Обычно берут среднюю/высокую мощность с финальным залпом — подберём
                варианты по бюджету и площадке.
              </p>
            </div>
          </article>

          <article id="birthday" className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Запуск салюта на день рождения
            </h2>
            <p className="text-sm text-gray-700">
              Поможем выбрать безопасный вариант для двора, дачи или частного дома. Подскажем дистанции, направление
              запуска и оптимальную длительность шоу.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>— Компактные решения и яркие финалы</li>
              <li>— Рекомендации по месту и подготовке площадки</li>
              <li>— Профессиональный запуск по правилам безопасности</li>
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="rounded-md bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800"
              >
                Получить консультацию
              </button>
              <Link href="/delivery" className="text-sm font-medium text-orange-700 underline hover:text-orange-900">
                Условия доставки
              </Link>
            </div>
            <div className="mt-5 rounded-lg bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Частые вопросы</h3>
              <p className="mt-2 text-sm text-gray-700">
                Можно ли устроить небольшой салют? Да — подберём компактные батареи и безопасный сценарий под вашу
                площадку.
              </p>
            </div>
          </article>

          <article id="corporate" className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">
              Запуск салюта на корпоратив
            </h2>
            <p className="text-sm text-gray-700">
              Подходит для площадок, баз отдыха и мероприятий на открытом воздухе. Согласуем формат запуска,
              логистику и требования безопасности для гостей.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-700">
              <li>— Сценарий запуска под мероприятие и бюджет</li>
              <li>— Подготовка площадки и организация безопасной зоны</li>
              <li>— Контроль проведения и финальный эффект</li>
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="rounded-md bg-orange-700 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-800"
              >
                Обсудить мероприятие
              </button>
              <Link href="/services/launching" className="text-sm font-medium text-orange-700 underline hover:text-orange-900">
                Подробнее об услуге
              </Link>
            </div>
            <div className="mt-5 rounded-lg bg-gray-50 p-4">
              <h3 className="text-sm font-semibold text-gray-900">Частые вопросы</h3>
              <p className="mt-2 text-sm text-gray-700">
                Можно ли сделать шоу под тайминг программы? Да — согласуем время запуска и формат финала заранее.
              </p>
            </div>
          </article>
        </div>
      </section>

      <VideoReviewsSection videoReviews={videoReviews || []} />

      <ServicesCTASection onConsultationClick={() => setIsDialogOpen(true)} />

      <section className="container mx-auto px-4 pb-12">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Смотрите также</h2>
          <p className="text-sm text-gray-700">
            Для выбора пиротехники перейдите в{' '}
            <Link href="/catalog" className="font-medium text-orange-700 underline hover:text-orange-900">
              каталог
            </Link>
            . Условия доставки и самовывоза смотрите на странице{' '}
            <Link href="/delivery" className="font-medium text-orange-700 underline hover:text-orange-900">
              доставка / самовывоз
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Диалог консультации */}
      <ConsultationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "СалютГрад - Организация запуска салютов",
            "description": "Организация запуска салютов и фейерверков в Москве и МО. Безопасный запуск пиротехники для свадеб, дней рождения, корпоративов.",
            "url": "https://salutgrad.ru/services/launching",
            "telephone": "+7 (977) 360-20-08",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "улица Агрогородок, вл31",
              "addressLocality": "деревня Чёрное",
              "addressRegion": "Московская область",
              "addressCountry": "RU",
              "postalCode": "143921"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "55.744657",
              "longitude": "38.050318"
            },
            "openingHours": "Mo-Su 09:00-21:00",
            "areaServed": ["Москва", "Московская область"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Услуги организации запуска салютов",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Организация запуска салютов",
                    "description": "Организация запуска фейерверков с полным сопровождением и соблюдением всех норм",
                    "provider": {
                      "@type": "Organization",
                      "name": "СалютГрад"
                    },
                    "serviceType": "Пиротехнические услуги",
                    "category": "Развлечения и праздники"
                  },
                  "priceValidUntil": "2025-12-31",
                  "eligibleRegion": ["RU-MOW", "RU-MOS"],
                  "availability": "https://schema.org/InStock"
                }
              ]
            },
          })
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqItems.map((item) => ({
              "@type": "Question",
              "name": item.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer,
              },
            })),
          }),
        }}
      />
    </div>
  );
}
