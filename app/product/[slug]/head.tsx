import { db } from '@/lib/db';
import { categories, manufacturers, products } from '@/db/schema';
import { eq } from 'drizzle-orm';
import slugify from 'slugify';
import { PRICE_VALID_UNTIL } from '@/lib/schema-constants';

const SITE_URL = 'https://salutgrad.ru';
const PRODUCT_IMAGE_FALLBACK = `${SITE_URL}/icons/icon_192.png`;

type HeadProps = {
  params: {
    slug: string;
  };
};

function getCleanSlug(originalSlug: string): string {
  if (originalSlug.includes(' ') || originalSlug.includes('+')) {
    return slugify(originalSlug, { lower: true, strict: true, trim: true });
  }
  return originalSlug;
}

export default async function Head({ params }: HeadProps) {
  const cleanSlug = getCleanSlug(params.slug);

  const rows = await db
    .select({
      product: products,
      category: categories,
      manufacturer: manufacturers,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.category_id))
    .leftJoin(manufacturers, eq(manufacturers.id, products.manufacturer_id))
    .where(eq(products.slug, cleanSlug))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const productUrl = `${SITE_URL}/product/${row.product.slug}`;
  const productImages =
    row.product.images && row.product.images.length > 0
      ? row.product.images
      : [PRODUCT_IMAGE_FALLBACK];

  const productStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: row.product.name,
    description:
      row.product.short_description ||
      row.product.description ||
      `Качественный ${row.product.name} для праздников`,
    brand: {
      '@type': 'Brand',
      name: row.manufacturer?.name || 'СалютГрад',
    },
    image: productImages,
    sku: row.product.id,
    category: row.category?.name || 'Пиротехника',
    url: productUrl,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      price: row.product.price,
      priceCurrency: 'RUB',
      priceValidUntil: PRICE_VALID_UNTIL,
      availability:
        row.product.is_active !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productStructuredData),
        }}
      />
    </>
  );
}
