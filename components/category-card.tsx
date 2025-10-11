'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface CategoryCardProps {
    category: {
        id: string;
        name: string;
        slug: string;
        image?: string | null;
    };
}

export function CategoryCard({ category }: CategoryCardProps) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <Link href={`/catalog?category=${category.slug}`}>
            <Card className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg">
                <div className="relative aspect-square min-h-[120px]">
                    {category.image && category.image.trim() !== '' && !imageError ? (
                        <Image
                            src={category.image}
                            alt={`${category.name} - фейерверки и пиротехника`}
                            fill
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            loading="lazy"
                            onError={handleImageError}
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 p-4 text-center">
                            <div className="mb-3 text-4xl opacity-60">🎆</div>
                            <div className="text-sm font-medium text-gray-700 line-clamp-2">
                                {category.name}
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                                Категория
                            </div>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="px-2 text-center text-sm font-semibold text-white md:text-base">
                            {category.name}
                        </h3>
                    </div>
                </div>
            </Card>
        </Link>
    );
}
