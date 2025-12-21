/**
 * Типы для каталога товаров
 */

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    category_id: string | null;
    category_name?: string | null;
    category_slug?: string | null;
    images: string[] | null;
    video_url?: string | null;
    is_popular: boolean | null;
    characteristics?: Record<string, any> | null;
    short_description?: string | null;
    event_types?: string[] | null;
}

export interface Pagination {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface CatalogStats {
    minPrice: number;
    maxPrice: number;
}

export interface ShotsStats {
    min: number;
    max: number;
}

export interface InitialData {
    categories: Category[];
    products: Product[];
    pagination: Pagination;
    stats: CatalogStats;
}

export interface CatalogClientProps {
    initialData: InitialData;
    searchParams: { [key: string]: string | string[] | undefined };
}

