import { Pagination } from './pagination';

interface PaginationData {
    page: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

interface CatalogPaginationInfoProps {
    pagination: PaginationData;
    onPageChange: (page: number) => void;
    showTotalCount?: boolean;
}

export function CatalogPaginationInfo({
    pagination,
    onPageChange,
    showTotalCount = false,
}: CatalogPaginationInfoProps) {
    if (pagination.totalPages <= 1) {
        return null;
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
                Страница {pagination.page} из {pagination.totalPages}
                {showTotalCount && pagination.totalCount > 0 && (
                    <span className="ml-2">({pagination.totalCount} товаров)</span>
                )}
            </div>
            <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPrevPage={pagination.hasPrevPage}
                onPageChange={onPageChange}
            />
        </div>
    );
}

