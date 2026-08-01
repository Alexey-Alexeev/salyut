/**
 * Клиентские функции каталога, заказа и заявки.
 *
 * - fetchProducts: поиск/фильтрация/сортировка/пагинация каталога ЦЕЛИКОМ в
 *   браузере по данным из salutgrad.ru/api/catalog.php (81 товар — грузим один
 *   раз и кэшируем). Заменяет прежние прямые запросы к Supabase.
 * - createOrder / createConsultation: POST на PHP-обработчики reg.ru.
 *
 * База API — NEXT_PUBLIC_API_BASE (для локальной разработки можно указать
 * https://salutgrad.ru/api), по умолчанию относительный '/api'.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, '') || '/api';

// ================== PRODUCTS (клиентская фильтрация) ==================

export interface ProductFilters {
    search?: string;
    categoryId?: string[];
    minPrice?: number;
    maxPrice?: number;
    minShots?: number;
    maxShots?: number;
    eventType?: 'wedding' | 'birthday' | 'new_year';
    sortBy?: string;
    page?: number;
    limit?: number;
}

interface CatalogItem {
    id: string;
    name: string;
    slug: string;
    price: number;
    old_price: number | null;
    category_id: string | null;
    category_name: string | null;
    category_slug: string | null;
    images: string[];
    video_url: string | null;
    is_popular: boolean;
    is_active: boolean;
    short_description: string | null;
    characteristics: Record<string, any> | null;
    event_types: string[];
    created_at: string | null;
    [key: string]: any;
}

// Кэш каталога в памяти вкладки (грузим один раз)
let catalogCache: { products: CatalogItem[]; categories: any[] } | null = null;
let catalogInflight: Promise<{ products: CatalogItem[]; categories: any[] }> | null = null;

async function loadCatalog() {
    if (catalogCache) return catalogCache;
    if (!catalogInflight) {
        catalogInflight = (async () => {
            const res = await fetch(`${API_BASE}/catalog.php`);
            if (!res.ok) throw new Error(`catalog.php HTTP ${res.status}`);
            const data = await res.json();
            const categories = data.categories || [];
            const catById = new Map<string, any>(categories.map((c: any) => [c.id, c]));
            const products: CatalogItem[] = (data.products || [])
                .filter((p: any) => p.is_active)
                .map((p: any) => ({
                    ...p,
                    category_name: catById.get(p.category_id)?.name ?? null,
                    category_slug: catById.get(p.category_id)?.slug ?? null,
                }));
            catalogCache = { products, categories };
            return catalogCache;
        })();
    }
    return catalogInflight;
}

export async function fetchProducts(filters: ProductFilters = {}) {
    try {
        const {
            search,
            categoryId,
            minPrice,
            maxPrice,
            minShots,
            maxShots,
            eventType,
            sortBy = 'name',
            page = 1,
            limit = 20,
        } = filters;

        const { products, categories } = await loadCatalog();
        let list = products.slice();

        // Поиск: по названию товара, а также по названию категории
        if (search && search.trim()) {
            const term = search.trim().toLowerCase();
            const matchedCategoryIds = categories
                .filter((c: any) => (c.name || '').toLowerCase().includes(term))
                .map((c: any) => c.id);

            if ((!categoryId || categoryId.length === 0) && matchedCategoryIds.length > 0) {
                list = list.filter(
                    (p) =>
                        p.name.toLowerCase().includes(term) ||
                        matchedCategoryIds.includes(p.category_id)
                );
            } else {
                list = list.filter((p) => p.name.toLowerCase().includes(term));
            }
        }

        // Категории
        if (categoryId && categoryId.length > 0) {
            list = list.filter((p) => p.category_id && categoryId.includes(p.category_id));
        }

        // Цена
        if (minPrice !== undefined && minPrice > 0) {
            list = list.filter((p) => p.price >= minPrice);
        }
        if (maxPrice !== undefined && maxPrice > 0) {
            list = list.filter((p) => p.price <= maxPrice);
        }

        // Тип события
        if (eventType) {
            list = list.filter(
                (p) => Array.isArray(p.event_types) && p.event_types.includes(eventType)
            );
        }

        // Количество залпов (из characteristics)
        if (minShots !== undefined || maxShots !== undefined) {
            list = list.filter((p) => {
                const shotsStr = p.characteristics?.['Кол-во залпов'];
                if (!shotsStr) return false;
                const shots = parseInt(String(shotsStr), 10);
                if (isNaN(shots)) return false;
                if (minShots !== undefined && shots < minShots) return false;
                if (maxShots !== undefined && shots > maxShots) return false;
                return true;
            });
        }

        // Сортировка (должна совпадать с серверной в lib/catalog-server.ts)
        const byName = (a: CatalogItem, b: CatalogItem) =>
            a.name.localeCompare(b.name, 'ru') || a.id.localeCompare(b.id);
        switch (sortBy) {
            case 'price-asc':
            case 'price_asc':
                list.sort((a, b) => a.price - b.price || byName(a, b));
                break;
            case 'price-desc':
            case 'price_desc':
                list.sort((a, b) => b.price - a.price || byName(a, b));
                break;
            case 'popular':
                list.sort(
                    (a, b) => Number(!!b.is_popular) - Number(!!a.is_popular) || byName(a, b)
                );
                break;
            case 'newest':
                list.sort(
                    (a, b) =>
                        String(b.created_at || '').localeCompare(String(a.created_at || '')) ||
                        byName(a, b)
                );
                break;
            case 'name':
            default:
                list.sort(byName);
                break;
        }

        const totalCount = list.length;
        const totalPages = Math.ceil(totalCount / limit);
        const from = (page - 1) * limit;
        const pageItems = list.slice(from, from + limit);

        return {
            products: pageItems,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// ================== ORDERS ==================

export interface CreateOrderData {
    customer_name: string;
    customer_contact: string | null;
    contact_method: string;
    comment?: string | null;
    total_amount: number;
    delivery_cost: number;
    discount_amount: number;
    age_confirmed: boolean;
    professional_launch_requested?: boolean;
    delivery_method: 'delivery' | 'pickup';
    delivery_address?: string | null;
    distance_from_mkad?: number | null;
    items: Array<{
        product_id: string;
        quantity: number;
        price_at_time: number;
    }>;
}

export async function createOrder(orderData: CreateOrderData) {
    try {
        const res = await fetch(`${API_BASE}/create-order.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });

        let data: any = null;
        try {
            data = await res.json();
        } catch {
            // тело не JSON
        }

        if (!res.ok || !data?.success) {
            throw new Error(data?.error || 'Не удалось оформить заказ');
        }

        return data; // { success: true, order: { id } }
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

// ================== CONSULTATIONS ==================

export interface CreateConsultationData {
    name: string;
    contactMethod: string;
    contactInfo: string;
    message?: string;
}

export async function createConsultation(data: CreateConsultationData) {
    try {
        const res = await fetch(`${API_BASE}/create-consultation.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        let json: any = null;
        try {
            json = await res.json();
        } catch {
            // тело не JSON
        }

        if (!res.ok || !json?.success) {
            throw new Error(json?.error || 'Не удалось отправить заявку');
        }

        return json; // { success: true, consultation: { id } }
    } catch (error) {
        console.error('Error creating consultation:', error);
        throw error;
    }
}
