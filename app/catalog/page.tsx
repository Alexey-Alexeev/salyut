import { Suspense } from 'react';
import { CatalogLoading } from '@/components/catalog/catalog-loading';
import { getCategoriesData, getProductsData, getProductsStatsData, getProductsDataWithCategories } from '@/lib/catalog-server';
import { Metadata } from 'next';
import dynamicImport from 'next/dynamic';

// Динамический импорт для уменьшения размера бандла
const CatalogClient = dynamicImport(() => import('./catalog-client').then(mod => ({ default: mod.CatalogClient })), {
  loading: () => <CatalogLoading />,
  ssr: true
});

export const metadata: Metadata = {
  title: 'Каталог фейерверков и салютов',
  description: 'Каталог качественных фейерверков и салютов в Москве и МО. Большой выбор пиротехники от проверенных производителей. Доставка и самовывоз.',
  keywords: 'каталог фейерверков, каталог салютов, пиротехника москва, фейерверки каталог, салюты каталог, купить фейерверки',
  openGraph: {
    title: 'Каталог фейерверков и салютов',
    description: 'Каталог качественных фейерверков и салютов в Москве и МО. Большой выбор пиротехники от проверенных производителей.',
    url: 'https://salutgrad.ru/catalog/',
    type: 'website',
    locale: 'ru_RU',
  },
  alternates: {
    canonical: 'https://salutgrad.ru/catalog/',
  },
};


interface CatalogPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Загружаем данные параллельно
  const [categories, productsResponse, stats] = await Promise.all([
    getCategoriesData(),
    getProductsData(1, 20, 'popular'),
    getProductsStatsData(),
  ]);

  const initialData = {
    categories,
    products: productsResponse.products || [],
    pagination: productsResponse.pagination,
    stats,
  };

  return (
    <Suspense fallback={<CatalogLoading />}>
      <CatalogClient
        initialData={initialData}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
