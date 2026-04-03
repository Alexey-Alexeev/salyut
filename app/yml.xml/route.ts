import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { categories, manufacturers, products } from '@/db/schema';

const SITE_URL = 'https://salutgrad.ru';
const SHOP_NAME = 'СалютГрад';
const SHOP_COMPANY = 'СалютГрад';
const SHOP_CURRENCY = 'RUR';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function toObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export async function GET() {
  try {
    const activeProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        old_price: products.old_price,
        category_id: products.category_id,
        manufacturer_id: products.manufacturer_id,
        images: products.images,
        description: products.description,
        characteristics: products.characteristics,
        is_active: products.is_active,
      })
      .from(products)
      .where(eq(products.is_active, true));

    const categoryIds = Array.from(
      new Set(activeProducts.map((item) => item.category_id).filter((id): id is string => Boolean(id)))
    );

    const manufacturerIds = Array.from(
      new Set(activeProducts.map((item) => item.manufacturer_id).filter((id): id is string => Boolean(id)))
    );

    const categoryRows = categoryIds.length
      ? await db
          .select({ id: categories.id, name: categories.name })
          .from(categories)
          .where(inArray(categories.id, categoryIds))
      : [];

    const manufacturerRows = manufacturerIds.length
      ? await db
          .select({ id: manufacturers.id, name: manufacturers.name })
          .from(manufacturers)
          .where(inArray(manufacturers.id, manufacturerIds))
      : [];

    const categoriesById = new Map(categoryRows.map((row) => [row.id, row]));
    const manufacturersById = new Map(manufacturerRows.map((row) => [row.id, row]));

    // Яндекс.Товары: id категории — только цифры, не более 18 символов (UUID отклоняется).
    const sortedCategoryRows = [...categoryRows].sort((a, b) => a.id.localeCompare(b.id));
    const yandexCategoryIdByUuid = new Map<string, string>();
    sortedCategoryRows.forEach((row, index) => {
      yandexCategoryIdByUuid.set(row.id, String(index + 1));
    });

    const offersXml = activeProducts
      .filter((product) => product.category_id && categoriesById.has(product.category_id))
      .map((product) => {
        const category = categoriesById.get(product.category_id!);
        const manufacturer = product.manufacturer_id
          ? manufacturersById.get(product.manufacturer_id)
          : undefined;
        const images = toArray(product.images);
        const characteristics = toObject(product.characteristics);

        const pictureXml = images
          .map((url) => `        <picture>${escapeXml(url)}</picture>`)
          .join('\n');

        const paramXml = Object.entries(characteristics)
          .filter(([key, value]) => typeof key === 'string' && value !== null && value !== undefined)
          .map(([key, value]) => {
            const normalizedValue =
              typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
                ? String(value)
                : JSON.stringify(value);
            return `        <param name="${escapeXml(key)}">${escapeXml(normalizedValue)}</param>`;
          })
          .join('\n');

        const oldPriceXml =
          product.old_price && product.old_price > product.price
            ? `\n        <oldprice>${product.old_price}</oldprice>`
            : '';

        const vendorXml = manufacturer?.name
          ? `\n        <vendor>${escapeXml(manufacturer.name)}</vendor>`
          : '';

        const descriptionXml = product.description
          ? `\n        <description>${escapeXml(product.description)}</description>`
          : '';

        const picturesBlock = pictureXml ? `\n${pictureXml}` : '';
        const paramsBlock = paramXml ? `\n${paramXml}` : '';

        return [
          `      <offer id="${escapeXml(product.id)}" available="${product.is_active ? 'true' : 'false'}">`,
          `        <name>${escapeXml(product.name)}</name>`,
          `${vendorXml}`,
          `        <url>${SITE_URL}/product/${escapeXml(product.slug)}</url>`,
          `        <price>${product.price}</price>${oldPriceXml}`,
          `        <currencyId>${SHOP_CURRENCY}</currencyId>`,
          `        <categoryId>${yandexCategoryIdByUuid.get(category!.id)!}</categoryId>${picturesBlock}`,
          `${descriptionXml}${paramsBlock}`,
          '      </offer>',
        ]
          .join('\n')
          .replace(/\n{2,}/g, '\n');
      })
      .join('\n');

    const categoriesXml = sortedCategoryRows
      .map(
        (category) =>
          `      <category id="${yandexCategoryIdByUuid.get(category.id)!}">${escapeXml(category.name)}</category>`
      )
      .join('\n');

    const generatedAt = new Date().toISOString().slice(0, 19);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog date="${generatedAt}">
  <shop>
    <name>${escapeXml(SHOP_NAME)}</name>
    <company>${escapeXml(SHOP_COMPANY)}</company>
    <url>${SITE_URL}</url>
    <currencies>
      <currency id="${SHOP_CURRENCY}" rate="1"/>
    </currencies>
    <categories>
${categoriesXml}
    </categories>
    <offers>
${offersXml}
    </offers>
  </shop>
</yml_catalog>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('YML feed generation failed', error);
    return NextResponse.json(
      { error: 'Failed to generate YML feed' },
      { status: 500 }
    );
  }
}
