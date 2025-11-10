import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FloatingConsultation } from '@/components/floating-consultation';
import { ExitIntentConsultation } from '@/components/exit-intent-consultation';
import { Toaster } from '@/components/ui/sonner';
import { ConditionalNoIndex } from '@/components/conditional-head';
import { OrganizationJsonLd } from '@/components/organization-jsonld';
import { CacheBuster } from '@/components/cache-buster';
import MobileExitBottomSheet from '@/components/mobile-exit-bottom-sheet';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'СалютГрад - Фейерверки и салюты в Москве и МО',
    template: '%s | СалютГрад'
  },
  description:
    'Лучшие фейерверки, салюты и пиротехника в Москве. Быстрая доставка по Москве и МО, безопасный запуск салютов. Качественная пиротехника для незабываемых праздников!',
  keywords:
    'фейерверки москва, салюты купить, пиротехника, петарды, ракеты, фонтаны, новый год, день рождения, свадьба, безопасный запуск салютов, доставка москва',
  // robots настройки будут управляться условными компонентами
  viewport: 'width=device-width, initial-scale=1',
  verification: {
    google: 'google-site-verification=UjQUv2ZFXE-S-XJK7fTzHRH9SF3sewBPrJMwc8w-4X4', // Замените на реальный код
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
        {/* DNS prefetch и preconnect для внешних ресурсов */}
        <link rel="dns-prefetch" href="https://gqnwyyinswqoustiqtpk.supabase.co" />
        <link rel="preconnect" href="https://gqnwyyinswqoustiqtpk.supabase.co" crossOrigin="anonymous" />
        
        {/* Основной favicon для всех браузеров и поисковых систем */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="msapplication-TileImage" content="/favicon.ico" />
        
        {/* PNG иконки для современных браузеров */}
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
        <meta property="og:site_name" content="СалютГрад" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="ru_RU" />
        <meta property="og:image" content="https://salutgrad.ru/icons/og_image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@салютград" />
        <meta name="twitter:image" content="https://salutgrad.ru/icons/twitter_card.png" />
        <meta name="geo.region" content="RU-MOW" />
        <meta name="geo.placename" content="Москва" />
        <meta name="geo.position" content="55.7558;37.6176" />
        <meta name="ICBM" content="55.7558, 37.6176" />
        
        {/* Yandex.Metrika counter */}
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
              })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=104700931', 'ym');

              ym(104700931, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
            `,
          }}
        />
        <noscript>
          <div>
            <img 
              src="https://mc.yandex.ru/watch/104700931" 
              style={{position:'absolute', left:'-9999px'}} 
              alt="" 
            />
          </div>
        </noscript>
        {/* /Yandex.Metrika counter */}
        
        {/* Conditional noindex meta tags - только для Vercel */}
        <ConditionalNoIndex />
        
        {/* Service Worker для управления кэшем */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                    })
                    .catch((error) => {
                    });
                });
              }
            `,
          }}
        />
        
        {/* Глобальная JSON-LD разметка организации для всех страниц */}
        <OrganizationJsonLd />
      </head>
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <FloatingConsultation />
        <ExitIntentConsultation />
        {/** Mobile bottom sheet exit-intent */}
        {/** Rendered globally; component self-guards to mobile and eligible pages */}
        <MobileExitBottomSheet />
        <Toaster />
        <CacheBuster />
      </body>
    </html>
  );
}
