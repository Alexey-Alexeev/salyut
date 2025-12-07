import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
    cityName?: string; // Название города в предложном падеже (например: "Балашихе", "Москве")
}

export function HeroSection({ cityName }: HeroSectionProps) {
    return (
        <section className="relative flex min-h-[50vh] items-center justify-center overflow-hidden py-12 sm:py-16 md:min-h-[70vh]">
            <div className="absolute inset-0 z-0">
                {/* CSS gradient placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
                <Image
                    src="/images/hero-bg.webp"
                    alt="Красивые фейерверки и салюты в ночном небе - СалютГрад"
                    fill
                    className="object-cover transition-opacity duration-500"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl space-y-4 px-4 text-center">
                <h1 className="rounded-lg bg-black/40 p-4 text-4xl font-bold leading-tight text-white md:text-6xl">
                    {cityName ? (
                        <>
                            Купить незабываемые <span className="text-orange-400">салюты и фейерверки</span>{' '}
                            в {cityName}
                        </>
                    ) : (
                        <>
                            Купить незабываемые <span className="text-orange-400">салюты и фейерверки</span> для
                            ваших праздников
                        </>
                    )}
                </h1>

                <p className="mx-auto max-w-2xl rounded-lg bg-black/30 p-4 text-lg text-white md:text-xl">
                    {cityName ? (
                        <>
                            Качественная пиротехника от проверенных производителей с доставкой и безопасным запуском.
                        </>
                    ) : (
                        <>
                            Качественная пиротехника от проверенных производителей с доставкой по Москве и МО. Создайте магию праздника вместе с нами!
                        </>
                    )}
                </p>

                <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
                    <Button
                        aria-label="Смотреть каталог"
                        asChild
                        size="lg"
                        className="bg-orange-700 text-white shadow-lg hover:bg-orange-800"
                    >
                        <Link href="/catalog">Смотреть каталог</Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
