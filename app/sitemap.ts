import { MetadataRoute } from 'next';
import { getAllCitySlugs } from '@/lib/cities';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://салютград.рф';

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

  // City pages - важны для локального SEO
  const cityPages = getAllCitySlugs().map(citySlug => ({
    url: `${baseUrl}/${citySlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9, // Высокий приоритет для локальных страниц
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
