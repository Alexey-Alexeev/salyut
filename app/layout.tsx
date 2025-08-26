import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { FloatingConsultation } from '@/components/floating-consultation'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'КупитьСалюты - Фейерверки и салюты',
  description: 'Качественные фейерверки, петарды, салюты и пиротехника для незабываемых праздников. Быстрая доставка по всей России.',
  keywords: 'фейерверки, салюты, петарды, пиротехника, праздник, новый год, купить',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://купитьсалюты.рф" />
        <meta property="og:site_name" content="КупитьСалюты" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <FloatingConsultation />
        <Toaster />
      </body>
    </html>
  )
}