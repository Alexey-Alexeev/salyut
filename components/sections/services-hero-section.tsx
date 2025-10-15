'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ServicesHeroSectionProps {
    onConsultationClick: () => void;
}

export function ServicesHeroSection({ onConsultationClick }: ServicesHeroSectionProps) {
    return (
        <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden py-12 sm:py-16">
            <div className="absolute inset-0 z-0">
                {/* CSS gradient placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
                <Image
                    src="/images/services-bg.webp"
                    alt="Профессиональный запуск салютов, пиротехника на празднике"
                    fill
                    className="object-cover transition-opacity duration-500"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl space-y-6 px-4 text-center text-white">
                <h1 className="rounded-lg bg-black/40 p-4 text-3xl font-bold leading-tight text-white backdrop-blur-sm md:text-4xl lg:text-5xl">
                    <span className="text-orange-400">Профессиональный</span> запуск салютов
                </h1>
                <p className="mx-auto max-w-2xl rounded-lg bg-black/30 p-4 text-lg text-white md:text-xl">
                    Безопасная пиротехника для свадеб, дней рождения, корпоративов и ваших праздников. Работаем в Москве и МО.
                </p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                        size="lg"
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={onConsultationClick}
                    >
                        Заказать консультацию
                    </Button>
                </div>
            </div>
        </section>
    );
}
