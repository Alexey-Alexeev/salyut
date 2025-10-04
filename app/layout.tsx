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
    default: 'СалютГрад - Фейерверки и салюты в Москве',
    template: '%s | СалютГрад'
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://салютград.рф" />
        <meta property="og:site_name" content="СалютГрад" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ru_RU" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@салютград" />
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
