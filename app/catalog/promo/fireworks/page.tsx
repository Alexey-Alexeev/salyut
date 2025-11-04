import { Suspense } from 'react';
import { CatalogLoading } from '@/components/catalog/catalog-loading';
import { getCategoriesData, getProductsDataWithCategories, getProductsStatsData } from '@/lib/catalog-server';
import { Metadata } from 'next';
import dynamicImport from 'next/dynamic';

// Динамический импорт клиентского компонента
const PromoPageClient = dynamicImport(() => import('./promo-client').then(mod => ({ default: mod.PromoPageClient })), {
  loading: () => <CatalogLoading />,
  ssr: true
});

export const metadata: Metadata = {
  title: 'Фейерверки и веерные салюты - Специальное предложение | СалютГрад',
  description: 'Лучшие фейерверки и веерные салюты по выгодным ценам в Москве и МО. Быстрая доставка, гарантия качества. Закажите сейчас!',
  keywords: 'фейерверки купить, веерные салюты, пиротехника москва, салюты недорого, фейерверки цена',
  openGraph: {
    title: 'Фейерверки и веерные салюты - Специальное предложение',
    description: 'Лучшие фейерверки и веерные салюты по выгодным ценам. Быстрая доставка в Москве и МО.',
    url: 'https://salutgrad.ru/catalog/promo/fireworks',
    type: 'website',
    locale: 'ru_RU',
  },
  alternates: {
    canonical: 'https://salutgrad.ru/catalog/promo/fireworks',
  },
  other: {
    // Preconnect к критическим доменам для ускорения загрузки
    'preconnect': 'https://gqnwyyinswqoustiqtpk.supabase.co',
  },
};

export default async function PromoFireworksPage() {
  // Pre-render данных при сборке для мгновенной загрузки
  // Загружаем категории Fireworks и Fan-salutes с сортировкой по цене
  const [categories, productsResponse, stats] = await Promise.all([
    getCategoriesData(),
    getProductsDataWithCategories(['Fireworks', 'Fan-salutes'], 1, 20, 'price-asc'),
    getProductsStatsData(),
  ]);

  const initialData = {
    categories,
    products: productsResponse.products || [],
    pagination: productsResponse.pagination,
    stats,
  };

  // Передаем pre-rendered данные в клиентский компонент
  // Эти данные уже будут в HTML, никаких дополнительных запросов не нужно
  return (
    <Suspense fallback={<CatalogLoading />}>
      <PromoPageClient
        initialData={initialData}
        preSelectedCategories={['Fireworks', 'Fan-salutes']}
        preSortBy="price-asc"
      />
    </Suspense>
  );
}

