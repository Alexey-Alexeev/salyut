import { Metadata } from 'next';
import { db } from '@/lib/db';
import { reviews } from '@/db/schema';
import { desc } from 'drizzle-orm';
import LaunchingServicePage from './LaunchingServicePage';

// Metadata должен быть экспортирован на уровне модуля, не внутри компонента
export const metadata: Metadata = {
  title: 'Профессиональный запуск салютов | Безопасная пиротехника',
  description:
    'Профессиональный запуск салютов и фейерверков в Москве и МО. Безопасная пиротехника для свадеб, дней рождения, корпоративов и ваших праздников. Индивидуальный подход.',
  keywords:
    'профессиональный запуск салютов, запуск фейерверков на свадьбу, пиротехника на день рождения, безопасный запуск салютов, профессиональная пиротехника, салюты москва',
  openGraph: {
    title: 'Профессиональный запуск салютов',
    description:
      'Профессиональный запуск салютов и фейерверков в Москве и МО. Безопасная пиротехника для свадеб, дней рождения, корпоративов и ваших праздников.',
    url: 'https://salutgrad.ru/services/launching',
    siteName: 'СалютГрад',
    type: 'website',
    locale: 'ru_RU',
    images: [
      {
        url: 'https://salutgrad.ru/images/services-bg.webp',
        width: 1200,
        height: 630,
        alt: 'Профессиональный запуск салютов - СалютГрад',
      },
      {
        url: 'https://salutgrad.ru/images/services-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Профессиональный запуск салютов - СалютГрад',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Профессиональный запуск салютов',
    description:
      'Профессиональный запуск салютов и фейерверков в Москве и МО. Безопасная пиротехника для свадеб, дней рождения, корпоративов и ваших праздников.',
    images: ['https://salutgrad.ru/images/services-bg.webp', 'https://salutgrad.ru/images/services-bg.jpg'],
  },
  alternates: {
    canonical: 'https://salutgrad.ru/services/launching',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

// Удалите "use client" если он есть в файле
export default async function LaunchingPage() {
  // Загружаем видео-отзывы
  let videoReviews: any[] = [];

  try {
    videoReviews = await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.created_at))
      .limit(4);
  } catch (error) {
    console.error('Error loading reviews:', error);
  }

  return <LaunchingServicePage videoReviews={videoReviews} />;
}
