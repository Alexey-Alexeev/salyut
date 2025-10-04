import { Metadata } from 'next';
import LaunchingServicePage from './LaunchingServicePage';

// Metadata должен быть экспортирован на уровне модуля, не внутри компонента
export const metadata: Metadata = {
  title: 'Профессиональный запуск салютов в Москве | Безопасная пиротехника | СалютГрад',
  description:
    'Профессиональный запуск салютов и фейерверков в Москве и МО. Безопасная пиротехника для свадеб, дней рождения, корпоративов. Сертифицированные пиротехники, полная безопасность, индивидуальный подход.',
  keywords:
    'профессиональный запуск салютов москва, запуск фейерверков на свадьбу, пиротехника на день рождения, безопасный запуск салютов, профессиональная пиротехника москва',
  openGraph: {
    title: 'Профессиональный запуск салютов в Москве | СалютГрад',
    description:
      'Профессиональный запуск салютов и фейерверков в Москве и МО. Безопасная пиротехника для свадеб, дней рождения, корпоративов. Сертифицированные пиротехники.',
    url: 'https://салютград.рф/services/launching',
    siteName: 'СалютГрад',
    type: 'website',
    locale: 'ru_RU',
    images: [
      {
        url: 'https://салютград.рф/images/services-bg.webp',
        width: 1200,
        height: 630,
        alt: 'Профессиональный запуск салютов - СалютГрад',
      },
      {
        url: 'https://салютград.рф/images/services-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Профессиональный запуск салютов - СалютГрад',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Профессиональный запуск салютов в Москве | СалютГрад',
    description:
      'Профессиональный запуск салютов и фейерверков в Москве и МО. Безопасная пиротехника для свадеб, дней рождения.',
    images: ['https://салютград.рф/images/services-bg.webp', 'https://салютград.рф/images/services-bg.jpg'],
  },
  alternates: {
    canonical: 'https://салютград.рф/services/launching',
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
export default function LaunchingPage() {
  return <LaunchingServicePage />;
}
