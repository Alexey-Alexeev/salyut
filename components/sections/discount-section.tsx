import { PartyPopper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function DiscountSection() {
    return (
        <section className="w-full">
            <Card className="rounded-none bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <CardContent className="container mx-auto space-y-6 px-4 py-6 text-center md:py-12">
                    <h2 className="flex items-center justify-center gap-2 text-2xl font-bold md:text-4xl">
                        <PartyPopper
                            className="mr-2 inline-block animate-bounce text-yellow-200"
                            size={32}
                        />
                        Выгодные скидки при покупке!
                    </h2>
                    <p className="mx-auto max-w-2xl text-base text-white/90 md:text-lg">
                        Чем больше заказ, тем больше экономия — скидки применяются
                        автоматически
                    </p>
                    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
                        <Card className="border-white/20 bg-white/20 backdrop-blur">
                            <CardContent className="p-6 text-center">
                                <div className="mb-2 text-4xl font-bold text-yellow-300">
                                    🎁
                                </div>
                                <div className="mb-1 text-lg font-semibold">подарок</div>
                                <div className="text-sm text-white/90">
                                    при заказе от 10 000 ₽
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-white/20 bg-white/20 backdrop-blur">
                            <CardContent className="p-6 text-center">
                                <div className="mb-2 text-4xl font-bold text-yellow-300">
                                    5%
                                </div>
                                <div className="mb-1 text-lg font-semibold">скидка + подарок</div>
                                <div className="text-sm text-white/90">
                                    при заказе от 40 000 ₽
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-white/20 bg-white/20 backdrop-blur">
                            <CardContent className="p-6 text-center">
                                <div className="mb-2 text-4xl font-bold text-yellow-300">
                                    10%
                                </div>
                                <div className="mb-1 text-lg font-semibold">скидка + подарок</div>
                                <div className="text-sm text-white/90">
                                    при заказе от 60 000 ₽
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
}
