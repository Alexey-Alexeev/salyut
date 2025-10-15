import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function ProfessionalServicesSection() {
    return (
        <section className="w-full py-12">
            <Card className="rounded-none bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardContent className="container mx-auto px-4 py-8 md:py-16">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            <div className="flex flex-col justify-center space-y-8 text-center">
                                <div className="text-6xl">
                                    <span role="img" aria-label="фейерверк">🎆</span>
                                </div>
                                <h2 className="text-3xl font-bold md:text-4xl">
                                    Профессиональный запуск салютов
                                </h2>
                                <p className="text-lg text-white/90">
                                    Доверьте запуск профессионалам! Мы обеспечим полную
                                    безопасность, соблюдение всех норм и незабываемое шоу.{' '}
                                    <strong>
                                        Не рискуйте безопасностью — оставьте всё профессионалам!
                                    </strong>
                                </p>
                            </div>
                            <div className="flex flex-col justify-center space-y-6">
                                <div className="grid grid-cols-1 gap-6">
                                    <Card className="border-white/20 bg-white/20 backdrop-blur">
                                        <CardContent className="flex items-center gap-4 p-6">
                                            <div className="text-2xl">
                                                <span role="img" aria-label="безопасность">🛡️</span>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-lg font-semibold">
                                                    Безопасность и опыт
                                                </h3>
                                                <p className="text-sm text-white/90">
                                                    Опытные пиротехники с соблюдением всех мер
                                                    безопасности
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-white/20 bg-white/20 backdrop-blur">
                                        <CardContent className="flex items-center gap-4 p-6">
                                            <div className="text-2xl">
                                                <span role="img" aria-label="взрыв">💥</span>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-lg font-semibold">
                                                    Профессиональный подход
                                                </h3>
                                                <p className="text-sm text-white/90">
                                                    Качественное шоу по высшему уровню
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="border-white/20 bg-white/20 backdrop-blur">
                                        <CardContent className="flex items-center gap-4 p-6">
                                            <div className="text-2xl">
                                                <span role="img" aria-label="клиенты">👥</span>
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-lg font-semibold">
                                                    Много довольных клиентов
                                                </h3>
                                                <p className="text-sm text-white/90">
                                                    Клиенты, которые много раз сказали нам спасибо
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center pt-8">
                            <Button
                                asChild
                                aria-label="Подробнее об услуге"
                                size="lg"
                                variant="secondary"
                                className="w-auto whitespace-nowrap px-6"
                            >
                                <Link href="/services/launching">Подробнее об услуге</Link>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
