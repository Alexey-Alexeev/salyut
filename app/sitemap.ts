// Этот файл отключает автоматическую генерацию sitemap.xml в Next.js
// Вместо этого используется статический файл из public/sitemap.xml с полной разметкой

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  // Возвращаем пустой массив - Next.js не должен генерировать sitemap
  // Используется статический public/sitemap.xml
  return [];
}

