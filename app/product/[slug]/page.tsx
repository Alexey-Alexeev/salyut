import { Metadata } from 'next';
import { db } from '@/lib/db';
import { products, categories, manufacturers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import ProductClient from '@/app/product/[slug]/product-client';
import slugify from 'slugify';

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
    const product = await db
      .select()
      .from(products)
      .where(eq(products.slug, cleanSlug))
      .limit(1);

    if (!product[0]) {
      return {};
    }

    const productData = product[0];

    return {
      title: productData.seo_title || productData.name,
      description:
        productData.seo_description ||
        productData.short_description ||
        undefined,
      openGraph: {
        title: productData.seo_title || productData.name,
        description:
          productData.seo_description ||
          productData.short_description ||
          undefined,
        images: productData.images?.[0]
          ? [{ url: productData.images[0] as string }]
          : undefined,
      },
      alternates: { canonical: `https://salutgrad.ru/product/${productData.slug}/` },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {};
  }
}
export default async function ProductPage({ params }: PageProps) {
  try {

    // ✅ Используем clean slug для поиска
    const cleanSlug = getCleanSlug(params.slug);

    const product = await db
      .select()
      .from(products)
      .where(eq(products.slug, cleanSlug))
      .limit(1);

    if (!product[0]) {
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

    const productData = product[0];

    // Загружаем связанные данные
    let categoryData = null;
    let manufacturerData = null;

    if (productData.category_id) {
      try {
        const category = await db
          .select()
          .from(categories)
          .where(eq(categories.id, productData.category_id))
          .limit(1);
        categoryData = category[0] || null;
      } catch (error) {
        console.error('Error loading category:', error);
      }
    }

    if (productData.manufacturer_id) {
      try {
        const manufacturer = await db
          .select()
          .from(manufacturers)
          .where(eq(manufacturers.id, productData.manufacturer_id))
          .limit(1);
        manufacturerData = manufacturer[0] || null;
      } catch (error) {
        console.error('Error loading manufacturer:', error);
      }
    }

    return (
      <ProductClient
        product={productData}
        category={categoryData}
        manufacturer={manufacturerData}
      />
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
