import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FloatingConsultation } from '@/components/floating-consultation';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'СалютГрад - Фейерверки и салюты в Москве и МО',
    template: '%s | СалютГрад.рф'
  },
  description:
    'Лучшие фейерверки, салюты и пиротехника в Москве. Быстрая доставка по Москве и МО, профессиональный запуск салютов. Качественная пиротехника для незабываемых праздников!',
  keywords:
    'фейерверки москва, салюты купить, пиротехника, петарды, ракеты, фонтаны, новый год, день рождения, свадьба, профессиональный запуск салютов, доставка москва',
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
  viewport: 'width=device-width, initial-scale=1',
  verification: {
    google: 'your-google-verification-code', // Замените на реальный код
  },
  icons: {
    icon: [
      { url: '/icons/icon_16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon_32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon_48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon_64.png', sizes: '64x64', type: 'image/png' },
      { url: '/icons/icon_72.png', sizes: '72x72', type: 'image/png' },
      { url: '/icons/icon_128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon_192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon_256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icons/icon_512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon_64.png',
    apple: [
      { url: '/icons/icon_128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icons/icon_192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon_256.png', sizes: '256x256', type: 'image/png' },
      { url: '/icons/icon_512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/icons/favicon.ico" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon_16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon_32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon_48.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/icons/icon_64.png" />
        <link rel="icon" type="image/png" sizes="72x72" href="/icons/icon_72.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/icons/icon_128.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon_192.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/icons/icon_256.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon_512.png" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon_128.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon_192.png" />
        <link rel="apple-touch-icon" sizes="256x256" href="/icons/icon_256.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon_512.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="canonical" href="https://салютград.рф" />
        {/* Preload critical hero images */}
        <link rel="preload" as="image" href="/images/hero-bg.webp" />
        <link rel="preload" as="image" href="/images/hero-bg2.webp" />
        <link rel="preload" as="image" href="/images/services-bg.webp" />
        <meta property="og:site_name" content="СалютГрад" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content="https://салютград.рф/icons/og_image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@салютград" />
        <meta name="twitter:image" content="https://салютград.рф/icons/twitter_card.png" />
        <meta name="geo.region" content="RU-MOW" />
        <meta name="geo.placename" content="Москва" />
        <meta name="geo.position" content="55.7558;37.6176" />
        <meta name="ICBM" content="55.7558, 37.6176" />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <FloatingConsultation />
        <Toaster />
      </body>
    </html>
  );
}
