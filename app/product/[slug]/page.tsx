import { Metadata } from 'next';
import { cache } from 'react';
import slugify from 'slugify';
import ProductClient from '@/app/product/[slug]/product-client';
import { getCatalog, getProductBySlug } from '@/lib/catalog-data';

type PageProps = { params: { slug: string } };

const getCleanSlug = (originalSlug: string): string => {
  // Если slug содержит пробелы или спецсимволы
  if (originalSlug.includes(' ') || originalSlug.includes('+')) {
    return slugify(originalSlug, { lower: true, strict: true, trim: true });
  }
  return originalSlug;
};

export async function generateStaticParams() {
  try {
    const { products } = await getCatalog();
    return products.map((p) => ({ slug: p.slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const cleanSlug = getCleanSlug(params.slug);
    const product = await getProductWithRelations(cleanSlug);

    if (!product) {
      return {};
    }

    return {
      title: product.product.seo_title || product.product.name,
      description:
        product.product.seo_description ||
        product.product.short_description ||
        undefined,
      openGraph: {
        title: product.product.seo_title || product.product.name,
        description:
          product.product.seo_description ||
          product.product.short_description ||
          undefined,
        images: product.product.images?.[0]
          ? [{ url: product.product.images[0] as string }]
          : undefined,
      },
      alternates: { canonical: `https://salutgrad.ru/product/${product.product.slug}/` },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {};
  }
}

const getProductWithRelations = cache(async (slug: string) => {
  return getProductBySlug(slug);
});

const getRelatedProducts = cache(async (productId: string, categoryId?: string | null) => {
  const { products } = await getCatalog();
  const active = products.filter((p) => p.is_active && p.id !== productId);

  const pick = (p: (typeof active)[number]) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    old_price: p.old_price,
    images: p.images,
    is_popular: p.is_popular,
  });

  const sameCategory = categoryId
    ? active.filter((p) => p.category_id === categoryId).slice(0, 12).map(pick)
    : [];

  if (sameCategory.length >= 3) {
    return sameCategory;
  }

  const fallback = active.slice(0, 24).map(pick);

  const unique = new Map<string, ReturnType<typeof pick>>();
  for (const item of [...sameCategory, ...fallback]) {
    unique.set(item.id, item);
  }

  return Array.from(unique.values());
});

export default async function ProductPage({ params }: PageProps) {
  try {
    // ✅ Используем clean slug для поиска
    const cleanSlug = getCleanSlug(params.slug);
    const productData = await getProductWithRelations(cleanSlug);

    if (!productData) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Товар не найден</h1>
            <p className="text-muted-foreground mb-4">
              Запрашиваемый товар не существует или был удален.
            </p>
            <p className="text-muted-foreground text-sm">
              Запрошенный slug: {params.slug}
            </p>
            <p className="text-muted-foreground text-sm">
              Искомый slug: {cleanSlug}
            </p>
          </div>
        </div>
      );
    }

    const relatedProducts = await getRelatedProducts(
      productData.product.id,
      productData.product.category_id
    );

    return (
      <>
        <ProductClient
          product={productData.product}
          category={productData.category}
          manufacturer={productData.manufacturer}
          relatedProducts={relatedProducts}
        />
      </>
    );
  } catch (error) {
    console.error('Error loading product:', error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Ошибка загрузки</h1>
          <p className="text-muted-foreground">
            Произошла ошибка при загрузке товара.
          </p>
          <p className="text-muted-foreground mt-2 text-sm">
            Ошибка:{' '}
            {error instanceof Error ? error.message : 'Неизвестная ошибка'}
          </p>
        </div>
      </div>
    );
  }
}
