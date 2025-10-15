export function CatalogLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            {/* Breadcrumb Skeleton */}
            <div className="mb-6">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100"></div>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row">
                {/* Desktop Filters Skeleton */}
                <div className="hidden w-64 shrink-0 lg:block">
                    <div className="rounded-lg border p-6">
                        <div className="mb-4 h-6 w-20 animate-pulse rounded bg-gray-100"></div>
                        <div className="space-y-3">
                            <div className="h-4 w-24 animate-pulse rounded bg-gray-100"></div>
                            <div className="h-4 w-32 animate-pulse rounded bg-gray-100"></div>
                            <div className="h-4 w-28 animate-pulse rounded bg-gray-100"></div>
                            <div className="h-4 w-36 animate-pulse rounded bg-gray-100"></div>
                        </div>
                        <div className="mt-6">
                            <div className="mb-2 h-4 w-16 animate-pulse rounded bg-gray-100"></div>
                            <div className="flex gap-2">
                                <div className="h-9 flex-1 animate-pulse rounded bg-gray-100"></div>
                                <div className="h-9 flex-1 animate-pulse rounded bg-gray-100"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton */}
                <div className="flex-1">
                    {/* Mobile Controls Skeleton */}
                    <div className="mb-6 flex items-center justify-between lg:hidden">
                        <div className="h-9 w-20 animate-pulse rounded bg-gray-100"></div>
                        <div className="flex gap-1">
                            <div className="size-9 animate-pulse rounded bg-gray-100"></div>
                            <div className="size-9 animate-pulse rounded bg-gray-100"></div>
                        </div>
                    </div>

                    {/* Desktop Controls Skeleton */}
                    <div className="mb-6 hidden items-center justify-between lg:flex">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-100"></div>
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                <div className="size-9 animate-pulse rounded bg-gray-100"></div>
                                <div className="size-9 animate-pulse rounded bg-gray-100"></div>
                            </div>
                            <div className="h-9 w-44 animate-pulse rounded bg-gray-100"></div>
                        </div>
                    </div>

                    {/* Products Grid Skeleton */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="overflow-hidden rounded-lg border">
                                <div className="aspect-square animate-pulse bg-gray-100"></div>
                                <div className="space-y-2 p-4">
                                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100"></div>
                                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100"></div>
                                    <div className="h-8 w-full animate-pulse rounded bg-gray-100"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

