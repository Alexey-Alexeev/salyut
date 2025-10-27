import { Metadata } from 'next';
import CartPageClient from './cart-client';

export const metadata: Metadata = {
  title: 'Корзина - Фейерверки и салюты',
  description:
    'Оформление заказа фейерверков и салютов. Быстрая доставка по Москве и МО. Безопасный запуск салютов. Безопасная оплата, гарантия качества.',
  keywords:
    'корзина фейерверков, заказ салютов, купить фейерверки, доставка пиротехники москва, безопасный запуск салютов',
  openGraph: {
    title: 'Корзина - Фейерверки и салюты',
    description:
      'Оформление заказа фейерверков и салютов. Быстрая доставка по Москве и МО. Безопасный запуск салютов.',
    url: 'https://salutgrad.ru/cart',
    siteName: 'СалютГрад',
    type: 'website',
    locale: 'ru_RU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Корзина - Фейерверки и салюты',
    description:
      'Оформление заказа фейерверков и салютов. Быстрая доставка по Москве и МО.',
  },
  alternates: {
    canonical: 'https://salutgrad.ru/cart/',
  },
};

export default function CartPage() {
  return <CartPageClient />;
}