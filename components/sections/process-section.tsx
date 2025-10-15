import { Card } from '@/components/ui/card';
import {
    Calendar,
    Award,
    Clock,
    Shield,
    Sparkles,
    RussianRuble,
} from 'lucide-react';

export function ProcessSection() {
    return (
        <section className="bg-gray-50 py-16">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                        Индивидуальный подход к каждому клиенту
                    </h2>
                    <p className="mb-12 text-xl text-gray-600">
                        Мы понимаем, что каждое мероприятие уникально. Все детали
                        обсуждаются индивидуально с нашими менеджерами.
                    </p>

                    <div className="mb-12 grid gap-8 md:grid-cols-1">
                        <Card className="p-8">
                            <h3 className="mb-6 text-2xl font-semibold">
                                Что мы обсуждаем с вами:
                            </h3>
                            <div className="grid gap-6 text-left md:grid-cols-2">
                                <ul className="space-y-4 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <Calendar className="mt-0.5 size-5 shrink-0 text-orange-500" aria-hidden="true" />
                                        <span>Место проведения и его особенности</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Award className="mt-0.5 size-5 shrink-0 text-orange-500" aria-hidden="true" />
                                        <span>Объем и тип фейерверков</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Clock className="mt-0.5 size-5 shrink-0 text-orange-500" aria-hidden="true" />
                                        <span>Время проведения и продолжительность</span>
                                    </li>
                                </ul>
                                <ul className="space-y-4 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <Shield className="mt-0.5 size-5 shrink-0 text-orange-500" aria-hidden="true" />
                                        <span>Меры безопасности для конкретной площадки</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <Sparkles className="mt-0.5 size-5 shrink-0 text-orange-500" aria-hidden="true" />
                                        <span>Синхронизация с музыкой (при желании)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <RussianRuble className="mt-0.5 size-5 shrink-0 text-orange-500" aria-hidden="true" />
                                        <span>Стоимость и варианты оплаты (как правило, от 1 000 до 10 000₽ в зависимости от местоположения)</span>
                                    </li>
                                </ul>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </section>
    );
}
