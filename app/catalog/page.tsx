import { Suspense } from 'react';
import { CatalogLoading } from '@/components/catalog/catalog-loading';
import { CatalogClient } from './catalog-client';
import { getCategoriesData, getProductsData, getProductsStatsData } from '@/lib/catalog-server';

// Кэшируем данные на уровне Next.js
export const revalidate = 300; // 5 минут

// Статическая генерация для улучшения производительности
export const dynamic = 'force-static';


interface CatalogPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  // Загружаем данные параллельно с приоритетом для критических данных
  const [categories, productsResponse, stats] = await Promise.all([
    getCategoriesData(),
    getProductsData(1, 20, 'name'),
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
