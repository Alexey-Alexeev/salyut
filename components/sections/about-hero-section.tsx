import Image from 'next/image';

export function AboutHeroSection() {
    return (
        <section
            className="relative flex min-h-[70vh] items-center justify-center overflow-hidden"
            role="banner"
        >
            <div className="absolute inset-0 z-0">
                <Image
                    src="../../images/hero-bg2.webp"
                    alt="О компании - качественные фейерверки и салюты"
                    fill
                    className="object-cover"
                    priority
                    sizes="100vw"
                    placeholder="blur"
                    blurDataURL="../../images/hero-bg2.webp"
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
