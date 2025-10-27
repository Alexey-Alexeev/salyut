/**
 * Компонент для глобальной JSON-LD разметки организации
 * Используется на всех страницах сайта
 */

import { BUSINESS_INFO, SAME_AS_LINKS } from '@/lib/schema-constants';

interface OrganizationJsonLdProps {
  additionalData?: Record<string, any>;
}

export function OrganizationJsonLd({ additionalData = {} }: OrganizationJsonLdProps) {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "Store"],
    "name": BUSINESS_INFO.name,
    "description": "Лучшие фейерверки, салюты и пиротехника в Москве и МО. Быстрая доставка, безопасный запуск, гарантия качества.",
    "url": BUSINESS_INFO.url,
    "telephone": BUSINESS_INFO.telephone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": BUSINESS_INFO.address.streetAddress,
      "addressLocality": BUSINESS_INFO.address.addressLocality,
      "addressRegion": BUSINESS_INFO.address.addressRegion,
      "addressCountry": BUSINESS_INFO.address.addressCountry,
      "postalCode": BUSINESS_INFO.address.postalCode
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": BUSINESS_INFO.geo.latitude,
      "longitude": BUSINESS_INFO.geo.longitude
    },
    "openingHours": BUSINESS_INFO.openingHours,
    "priceRange": BUSINESS_INFO.priceRange,
    "sameAs": SAME_AS_LINKS,
    ...additionalData
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(organizationData)
      }}
    />
  );
}
