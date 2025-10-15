import { Card, CardContent } from '@/components/ui/card';
import { Shield, Heart, Award } from 'lucide-react';

export function AdvantagesSection() {
    return (
        <section
            className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16"
            aria-labelledby="advantages-heading"
        >
            <div className="container mx-auto px-4">
                <header className="mb-12 space-y-4 text-center">
                    <h2
                        id="advantages-heading"
                        className="text-3xl font-bold md:text-4xl"
                    >
                        Наши преимущества
                    </h2>
                    <p className="text-muted-foreground mx-auto max-w-2xl">
                        Почему клиенты выбирают именно нас
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3" role="list">
                    <article className="text-center h-full" role="listitem">
                        <Card className="h-full">
                            <CardContent className="flex flex-col space-y-4 p-6 h-full">
                                <Shield
                                    className="mx-auto size-16 text-orange-500"
                                    aria-hidden="true"
                                />
                                <h3 className="text-xl font-semibold">Профессиональный запуск</h3>
                                <p className="text-muted-foreground flex-grow">
                                    Доверьте запуск профессионалам! Мы обеспечим полную безопасность,
                                    соблюдение всех норм и незабываемое шоу. Не рискуйте — оставьте всё профессионалам!
                                </p>
                            </CardContent>
                        </Card>
                    </article>
                    <article className="text-center h-full" role="listitem">
                        <Card className="h-full">
                            <CardContent className="flex flex-col space-y-4 p-6 h-full">
                                <Heart
                                    className="mx-auto size-16 text-orange-500"
                                    aria-hidden="true"
                                />
                                <h3 className="text-xl font-semibold">Доставка по Москве и МО</h3>
                                <p className="text-muted-foreground flex-grow">
                                    Быстрая и надежная доставка по всей Москве и Московской области.
                                    Также доступен самовывоз в Балашихе. Удобно, быстро, безопасно!
                                </p>
                            </CardContent>
                        </Card>
                    </article>
                    <article className="text-center h-full" role="listitem">
                        <Card className="h-full">
                            <CardContent className="flex flex-col space-y-4 p-6 h-full">
                                <Award
                                    className="mx-auto size-16 text-orange-500"
                                    aria-hidden="true"
                                />
                                <h3 className="text-xl font-semibold">Гарантия качества</h3>
                                <p className="text-muted-foreground flex-grow">
                                    Все товары проходят строгий контроль качества и имеют
                                    необходимые сертификаты безопасности. Десятки довольных клиентов —
                                    лучшее подтверждение нашего качества!
                                </p>
                            </CardContent>
                        </Card>
                    </article>
                </div>
            </div>
        </section>
    );
}
