import { Metadata } from 'next';
import { db } from '@/lib/db';
import { products, categories, manufacturers } from '@/db/schema';
import { and, eq, ne } from 'drizzle-orm';
import ProductClient from '@/app/product/[slug]/product-client';
import slugify from 'slugify';
import { cache } from 'react';
import { PRICE_VALID_UNTIL } from '@/lib/schema-constants';

type PageProps = { params: { slug: string } };
const SITE_URL = 'https://salutgrad.ru';
const PRODUCT_IMAGE_FALLBACK = `${SITE_URL}/icons/icon_192.png`;

const getCleanSlug = (originalSlug: string): string => {
  // Если slug содержит пробелы или спецсимволы
  if (originalSlug.includes(' ') || originalSlug.includes('+')) {
    return slugify(originalSlug, { lower: true, strict: true, trim: true });
  }
  return originalSlug;
};

export async function generateStaticParams() {
  try {
    const rows = await db.select({ slug: products.slug }).from(products);
    return rows.map(r => ({ slug: r.slug })); // ✅ просто slug
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
  const rows = await db
    .select({
      product: products,
      category: categories,
      manufacturer: manufacturers,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.category_id))
    .leftJoin(manufacturers, eq(manufacturers.id, products.manufacturer_id))
    .where(eq(products.slug, slug))
    .limit(1);

  return rows[0] || null;
});

const getRelatedProducts = cache(async (productId: string, categoryId?: string | null) => {
  const sameCategory = categoryId
    ? await db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          price: products.price,
          old_price: products.old_price,
          images: products.images,
          is_popular: products.is_popular,
        })
        .from(products)
        .where(
          and(
            eq(products.is_active, true),
            eq(products.category_id, categoryId),
            ne(products.id, productId)
          )
        )
        .limit(12)
    : [];

  if (sameCategory.length >= 3) {
    return sameCategory;
  }

  const fallback = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      price: products.price,
      old_price: products.old_price,
      images: products.images,
      is_popular: products.is_popular,
    })
    .from(products)
    .where(and(eq(products.is_active, true), ne(products.id, productId)))
    .limit(24);

  const unique = new Map<string, (typeof fallback)[number]>();
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

    const productUrl = `${SITE_URL}/product/${productData.product.slug}`;
    const productImages =
      productData.product.images && productData.product.images.length > 0
        ? productData.product.images
        : [PRODUCT_IMAGE_FALLBACK];

    const productStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productData.product.name,
      description:
        productData.product.short_description ||
        productData.product.description ||
        `Качественный ${productData.product.name} для праздников`,
      brand: {
        '@type': 'Brand',
        name: productData.manufacturer?.name || 'СалютГрад',
      },
      image: productImages,
      sku: productData.product.id,
      category: productData.category?.name || 'Пиротехника',
      url: productUrl,
      offers: {
        '@type': 'Offer',
        url: productUrl,
        price: productData.product.price,
        priceCurrency: 'RUB',
        priceValidUntil: PRICE_VALID_UNTIL,
        availability:
          productData.product.is_active !== false
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
      },
    };

    const breadcrumbStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${SITE_URL}/catalog/` },
        ...(productData.category
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: productData.category.name,
                item: `${SITE_URL}/catalog?category=${productData.category.slug}`,
              },
            ]
          : []),
        {
          '@type': 'ListItem',
          position: productData.category ? 4 : 3,
          name: productData.product.name,
          item: `${productUrl}/`,
        },
      ],
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(productStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbStructuredData),
          }}
        />
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
