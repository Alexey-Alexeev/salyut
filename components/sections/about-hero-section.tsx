import Image from 'next/image';

export function AboutHeroSection() {
    return (
        <section
            className="relative flex min-h-[70vh] items-center justify-center overflow-hidden"
            role="banner"
        >
            <div className="absolute inset-0 z-0">
                {/* CSS gradient placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
                <Image
                    src="/images/hero-bg2.webp"
                    alt="О компании - качественные фейерверки и салюты"
                    fill
                    className="object-cover transition-opacity duration-500"
                    priority
                    sizes="100vw"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
                <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 mx-auto max-w-4xl space-y-6 px-4 text-center text-white">
                <h1 className="rounded-lg bg-black/40 p-4 text-4xl font-bold leading-tight text-white md:text-6xl">
                    О нашей <span className="text-orange-400">компании</span>
                </h1>
                <p className="mx-auto max-w-3xl rounded-lg bg-black/30 p-4 text-lg text-white md:text-xl">
                    Мы предлагаем качественную пиротехнику с гарантией безопасности,
                    создавая незабываемые праздники для вас и ваших близких
                </p>
            </div>
        </section>
    );
}
