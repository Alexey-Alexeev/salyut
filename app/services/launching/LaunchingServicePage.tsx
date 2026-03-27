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

      <div className="space-y-14">
        <section className="container mx-auto px-4 pt-8">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white/70 p-6 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-50/70 via-white/40 to-transparent" />
            <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Запуск под ваш праздник
                </h2>
                <p className="mt-1 text-sm text-gray-700">
                  Выберите сценарий — мы подстроим формат, безопасность и тайминг.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(true)}
                  className="inline-flex w-full items-center justify-center rounded-full bg-orange-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-800 sm:w-auto"
                >
                  Заказать консультацию
                </button>
                <Link
                  href="/catalog"
                  className="inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50 sm:w-auto"
                >
                  Подобрать салют
                </Link>
              </div>
            </div>

            <div className="relative mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Link
                href="#wedding"
                className="group rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-orange-700">Свадьба</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      Финал вечера и вынос торта
                    </div>
                  </div>
                  <span className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700">
                    #wedding
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Синхронизация с программой, безопасные зоны, эффектный финал.
                </div>
                <div className="mt-3 text-sm font-medium text-orange-700 underline underline-offset-2 group-hover:text-orange-900">
                  Перейти
                </div>
              </Link>

              <Link
                href="#birthday"
                className="group rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-orange-700">День рождения</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      Двор, дача, частный дом
                    </div>
                  </div>
                  <span className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700">
                    #birthday
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Компактные варианты, дистанции, направление и длительность шоу.
                </div>
                <div className="mt-3 text-sm font-medium text-orange-700 underline underline-offset-2 group-hover:text-orange-900">
                  Перейти
                </div>
              </Link>

              <Link
                href="#corporate"
                className="group rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-orange-700">Корпоратив</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      Площадки и базы отдыха
                    </div>
                  </div>
                  <span className="rounded-full border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700">
                    #corporate
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  Логистика, требования площадки, сценарий под бюджет и гостей.
                </div>
                <div className="mt-3 text-sm font-medium text-orange-700 underline underline-offset-2 group-hover:text-orange-900">
                  Перейти
                </div>
              </Link>
            </div>
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

        <section className="container mx-auto px-4 pb-14">
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold text-gray-900">Смотрите также</h2>
              <p className="text-sm text-gray-600">
                Полезные разделы перед заказом и запуском.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <Link
                href="/catalog"
                className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-orange-200 hover:bg-orange-50/40"
              >
                <div className="text-xs font-semibold text-orange-700">Каталог</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">Выбрать пиротехнику</div>
                <div className="mt-2 text-xs text-gray-600">Салюты, фонтаны, ракеты и другие категории.</div>
                <div className="mt-3 text-sm font-medium text-orange-700 underline underline-offset-2 group-hover:text-orange-900">
                  Открыть →
                </div>
              </Link>

              <Link
                href="/delivery"
                className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-orange-200 hover:bg-orange-50/40"
              >
                <div className="text-xs font-semibold text-orange-700">Доставка</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">Условия и самовывоз</div>
                <div className="mt-2 text-xs text-gray-600">Расчёт стоимости, сроки и адрес самовывоза.</div>
                <div className="mt-3 text-sm font-medium text-orange-700 underline underline-offset-2 group-hover:text-orange-900">
                  Посмотреть →
                </div>
              </Link>

              <Link
                href="/catalog?is_popular=true"
                className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-orange-200 hover:bg-orange-50/40"
              >
                <div className="text-xs font-semibold text-orange-700">Популярное</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">Хиты сезона</div>
                <div className="mt-2 text-xs text-gray-600">Быстрый выбор самых востребованных салютов.</div>
                <div className="mt-3 text-sm font-medium text-orange-700 underline underline-offset-2 group-hover:text-orange-900">
                  Открыть →
                </div>
              </Link>
            </div>
          </div>
        </section>
      </div>

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
