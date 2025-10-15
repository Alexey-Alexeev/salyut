import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function DeliverySection() {
    return (
        <section className="container mx-auto px-4 py-12">
            <div className="mb-12 space-y-4 text-center">
                <h2 className="text-3xl font-bold md:text-4xl">
                    Доставка и самовывоз
                </h2>
                <p className="text-muted-foreground mx-auto max-w-2xl">
                    Доставка к двери или самовывоз из пункта выдачи.{' '}
                    <span className="whitespace-nowrap rounded bg-red-700 px-2 py-1 font-semibold text-white">
                        Только Москва и Московская область
                    </span>
                </p>
            </div>

            <Card className="mx-auto max-w-4xl rounded-lg border border-orange-300 bg-gradient-to-br from-orange-50 to-green-50 p-6 shadow-lg md:p-8">
                <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2">
                    <div className="flex max-w-sm flex-col items-center text-center">
                        <div className="mb-2 text-6xl">
                            <span role="img" aria-label="доставка">🚚</span>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">Доставка</h3>
                        <p className="text-sm text-gray-800">
                            Доставка по Москве и Московской области в течение 1–3 дней.
                            Время согласовывается с менеджером.
                        </p>
                    </div>

                    <div className="flex max-w-sm flex-col items-center text-center">
                        <div className="mb-2 text-6xl">
                            <span role="img" aria-label="самовывоз">🏪</span>
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">Самовывоз</h3>
                        <p className="text-sm text-gray-800">
                            Самовывоз возможен из пункта выдачи в Балашихе. Заказ будет
                            готов к согласованному времени.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <Button
                        asChild
                        aria-label="Подробнее о доставке и самовывозе"
                        size="lg"
                        className="w-full max-w-xs rounded-lg bg-orange-700 font-semibold text-white shadow-lg transition-colors hover:bg-orange-800 sm:w-auto"
                    >
                        <Link href="/delivery">Подробнее о доставке и самовывозе</Link>
                    </Button>
                </div>
            </Card>
        </section>
    );
}
