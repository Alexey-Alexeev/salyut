'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { EVENT_TYPE_NAMES, EVENT_TYPE_IMAGES, type EventType } from '@/lib/schema-constants';

interface EventCollectionCardProps {
    eventType: EventType;
    productCount: number;
}

const EVENT_ICONS: Record<EventType, string> = {
    wedding: '💍',
    birthday: '🎂',
    new_year: '🎅',
};

const EVENT_DESCRIPTIONS: Record<EventType, string> = {
    wedding: 'Салюты для незабываемой свадьбы',
    birthday: 'Фейерверки на день рождения',
    new_year: 'Новогодние салюты и фейерверки',
};

export function EventCollectionCard({ eventType, productCount }: EventCollectionCardProps) {
    const [imageError, setImageError] = useState(false);
    const eventName = EVENT_TYPE_NAMES[eventType];
    const icon = EVENT_ICONS[eventType];
    const description = EVENT_DESCRIPTIONS[eventType];
    const imageUrl = EVENT_TYPE_IMAGES[eventType];

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <Link href={`/catalog?eventType=${eventType}`}>
            <Card className="group cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg">
                <div className="relative aspect-square min-h-[120px]">
                    {imageUrl && !imageError ? (
                        <>
                            <Image
                                src={imageUrl}
                                alt={`${eventName} - подборка салютов`}
                                fill
                                className="object-cover transition-transform duration-200 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                loading="lazy"
                                onError={handleImageError}
                            />
                            {/* Полупрозрачный темный оверлей для улучшения читаемости текста */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60 transition-colors group-hover:from-black/50 group-hover:via-black/40 group-hover:to-black/50 z-[1]" />
                        </>
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 p-4 text-center">
                            <div className="mb-3 text-5xl opacity-80">{icon}</div>
                            <div className="text-base font-semibold text-gray-800 line-clamp-2">
                                {eventName}
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                                {description}
                            </div>
                            {productCount > 0 && (
                                <div className="mt-3 rounded-full bg-orange-500 px-3 py-1 text-xs font-medium text-white">
                                    {productCount} {productCount === 1 ? 'салют' : productCount < 5 ? 'салюта' : 'салютов'}
                                </div>
                            )}
                        </div>
                    )}
                    {/* Текст поверх изображения с улучшенной читаемостью */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                        <div className="mb-2 text-4xl opacity-95 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            {icon}
                        </div>
                        <h3 className="px-2 text-center text-base font-bold text-white md:text-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            {eventName}
                        </h3>
                        <p className="mt-1 px-2 text-xs font-medium text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                            {description}
                        </p>
                        {productCount > 0 && (
                            <div className="mt-3 rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                                {productCount} {productCount === 1 ? 'салют' : productCount < 5 ? 'салюта' : 'салютов'}
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    );
}

