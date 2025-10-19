'use client';

import { useState } from 'react';
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

  return (
    <div className="min-h-screen">
      <ServicesHeroSection onConsultationClick={() => setIsDialogOpen(true)} />

      <FactsSection />

      <BenefitsSection />

      <ProcessSection />

      <VideoReviewsSection videoReviews={videoReviews || []} />

      <ServicesCTASection onConsultationClick={() => setIsDialogOpen(true)} />

      {/* Диалог консультации */}
      <ConsultationDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "СалютГрад - Безопасный запуск салютов",
            "description": "Безопасный запуск салютов и фейерверков в Москве и МО. Организация запуска пиротехники для свадеб, дней рождения, корпоративов.",
            "url": "https://salutgrad.ru/services/launching",
            "telephone": "+7 (977) 360-20-08",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Рассветная улица, 14",
              "addressLocality": "деревня Чёрное",
              "addressRegion": "Московская область",
              "addressCountry": "RU",
              "postalCode": "143921"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "55.740340",
              "longitude": "38.054064"
            },
            "openingHours": "Mo-Su 09:00-21:00",
            "areaServed": ["Москва", "Московская область"],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Услуги безопасного запуска салютов",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Безопасный запуск салютов",
                    "description": "Безопасный запуск фейерверков с полным сопровождением и соблюдением всех норм",
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
    </div>
  );
}
