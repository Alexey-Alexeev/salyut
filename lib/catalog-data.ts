/**
 * Единый источник данных каталога для СБОРКИ статического сайта.
 *
 * Тянет JSON с PHP-эндпоинта reg.ru (salutgrad.ru/api/catalog.php) вместо
 * прямого доступа к БД. Один запрос за сборку кэшируется на уровне модуля.
 *
 * Адрес можно переопределить через CATALOG_API_URL (напр. для стенда).
 */

const CATALOG_URL =
  process.env.CATALOG_API_URL || 'https://salutgrad.ru/api/catalog.php';

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at: string | null;
}

export interface CatalogManufacturer {
  id: string;
  name: string;
  country: string | null;
  description: string | null;
  created_at: string | null;
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  old_price: number | null;
  category_id: string | null;
  manufacturer_id: string | null;
  images: string[];
  video_url: string | null;
  description: string | null;
  short_description: string | null;
  characteristics: Record<string, any> | null;
  is_popular: boolean;
  is_active: boolean;
  event_types: string[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CatalogReview {
  id: string;
  customer_name: string;
  video_url: string;
  thumbnail_url: string | null;
  product_id: string | null;
  is_approved: boolean;
  sort_order: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface Catalog {
  categories: CatalogCategory[];
  manufacturers: CatalogManufacturer[];
  products: CatalogProduct[];
  reviews: CatalogReview[];
}

let catalogPromise: Promise<Catalog> | null = null;

async function fetchCatalogOnce(): Promise<Catalog> {
  const res = await fetch(CATALOG_URL, { cache: 'force-cache' });
  if (!res.ok) {
    throw new Error(`Не удалось загрузить каталог (${CATALOG_URL}): HTTP ${res.status}`);
  }
  const data = await res.json();
  return {
    categories: data.categories || [],
    manufacturers: data.manufacturers || [],
    products: data.products || [],
    reviews: data.reviews || [],
  };
}

// Повторяем при обрывах сети (ECONNRESET и т.п.), чтобы одна флуктуация
// во время сборки не «сорвала» страницы в client-side рендеринг.
async function fetchCatalogWithRetry(attempts = 4): Promise<Catalog> {
  let lastErr: unknown;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fetchCatalogOnce();
    } catch (e) {
      lastErr = e;
      if (i < attempts) {
        await new Promise((r) => setTimeout(r, 500 * i));
      }
    }
  }
  throw lastErr;
}

/** Возвращает весь каталог (кэшируется на время сборки). */
export function getCatalog(): Promise<Catalog> {
  if (!catalogPromise) {
    catalogPromise = fetchCatalogWithRetry().catch((err) => {
      // Не кэшируем неудачу — даём следующим страницам повторить попытку.
      catalogPromise = null;
      throw err;
    });
  }
  return catalogPromise;
}

/** Добавляет к товару поля category_name / category_slug (как раньше делал JOIN). */
export function withCategory(p: CatalogProduct, categories: CatalogCategory[]) {
  const c = categories.find((x) => x.id === p.category_id);
  return {
    ...p,
    category_name: c?.name ?? null,
    category_slug: c?.slug ?? null,
  };
}

/** Товар + категория + производитель по слагу (для страницы товара). */
export async function getProductBySlug(slug: string) {
  const { products, categories, manufacturers } = await getCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;
  const category = categories.find((c) => c.id === product.category_id) ?? null;
  const manufacturer =
    manufacturers.find((m) => m.id === product.manufacturer_id) ?? null;
  return { product, category, manufacturer };
}
