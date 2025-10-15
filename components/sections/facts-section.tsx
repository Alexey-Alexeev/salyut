import { Card } from '@/components/ui/card';
import { AlertTriangle, Flame } from 'lucide-react';

export function FactsSection() {
    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        Факты и статистика МЧС
                    </h2>
                    <p className="mb-12 text-gray-600">
                        Независимая статистика подтверждает: самостоятельный запуск
                        фейерверков — это не только риск, но и реальные последствия.
                    </p>

                    <div className="grid gap-8 md:grid-cols-2">
                        <Card className="flex flex-col items-center p-8 text-center shadow-md">
                            <AlertTriangle className="mb-4 size-12 text-red-600" aria-hidden="true" />
                            <p className="mb-4 text-5xl font-bold text-red-600">1000</p>
                            <p className="text-gray-700">
                                человек ежегодно госпитализируют после несчастных случаев с
                                пиротехникой по данным МЧС{' '}
                                <sup>
                                    <a
                                        href="https://pharmmedprom.ru/articles/chto-delat-pri-travmah-ot-pirotehniki-soveti-travmatologa/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        [источник]
                                    </a>
                                </sup>
                            </p>
                        </Card>

                        <Card className="flex flex-col items-center p-8 text-center shadow-md">
                            <Flame className="mb-4 size-12 text-orange-500" aria-hidden="true" />
                            <p className="mb-4 text-5xl font-bold text-orange-500">136</p>
                            <p className="text-gray-700">
                                пожаров за 2023 год, вызванных пиротехникой{' '}
                                <sup>
                                    <a
                                        href="https://newizv.ru/news/2023-12-31/v-mchs-rasskazali-kak-vybrat-pirotehniku-i-napomnili-o-zapretah-425768"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        [МЧС]
                                    </a>
                                </sup>
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
