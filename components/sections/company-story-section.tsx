import Image from 'next/image';

export function CompanyStorySection() {
    return (
        <section
            className="bg-gradient-to-br from-orange-50 to-red-50 py-16"
            itemScope
            itemType="https://schema.org/Organization"
        >
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold md:text-4xl">Наша история</h2>
                                <p className="text-muted-foreground text-lg">
                                    Мы начали свой путь с простой идеи — делать праздники ярче и
                                    незабываемее
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-2xl font-semibold">Наша миссия</h3>
                                <p className="text-muted-foreground" itemProp="description">
                                    Мы гарантируем полную безопасность каждого фейерверка. Все товары
                                    проходят строгий контроль качества и имеют необходимые сертификаты.
                                    Наша продукция соответствует всем требованиям безопасности и
                                    обеспечивает яркие, незабываемые впечатления.
                                </p>
                                <p className="text-muted-foreground">
                                    Каждый товар в нашем ассортименте тщательно отобран и проверен.
                                    Мы гордимся тем, что предлагаем только качественную продукцию,
                                    которая подарит вам и вашим близким незабываемые моменты радости
                                    и восторга.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center lg:justify-end">
                            <figure className="relative w-full max-w-md aspect-video overflow-hidden rounded-lg shadow-lg">
                                <Image
                                    src="../../images/hero-bg3.webp"
                                    alt="Качественные фейерверки и салюты с гарантией безопасности"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </figure>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
