import { MetadataRoute } from 'next';
import { moscowRegionCities, transliterate } from '@/lib/cities';
import { getBaseUrl } from '@/lib/domains';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();

  // Static pages
  const staticPages = [
    '',
    '/catalog',
    '/about',
    '/cart',
    '/delivery',
    '/safety',
    '/privacy',
    '/terms',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? ('daily' as const) : ('weekly' as const),
    priority: route === '' ? 1 : 0.8,
  }));

  // City pages for local SEO (new SEO-friendly URLs)
  const cityPages = moscowRegionCities.slice(0, 20).map(city => ({
    url: `${baseUrl}/${transliterate(city)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // Category pages
  const categories = [
    'firecrackers',
    'rockets',
    'fountains',
    'roman-candles',
    'sparklers',
  ].map(category => ({
    url: `${baseUrl}/catalog?category=${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Product pages (mock data - in real app, fetch from database)
  const products = [
    'golden-shower-36',
    'korsar-1-50',
    'volcano-fountain',
    'comet-rockets-12',
  ].map(slug => ({
    url: `${baseUrl}/product/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...cityPages, ...categories, ...products];
}
