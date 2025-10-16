'use client';

import { Button } from '@/components/ui/button';

interface ServicesCTASectionProps {
    onConsultationClick: () => void;
}

export function ServicesCTASection({ onConsultationClick }: ServicesCTASectionProps) {
    return (
        <section className="bg-gradient-to-r from-orange-500 to-red-500 py-16 text-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="mb-6 text-3xl font-bold md:text-4xl">
                    Готовы заказать безопасный запуск?
                </h2>
                <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
                    Просто отметьте услугу при оформлении заказа, и наш менеджер
                    свяжется с вами для обсуждения всех деталей и расчета стоимости.
                </p>
                <p className="mx-auto mb-8 max-w-2xl text-xl text-white/90">
                    Или закажите консультацию сейчас
                </p>
                <Button
                    size="lg"
                    variant="secondary"
                    className="w-auto whitespace-nowrap px-6"
                    onClick={onConsultationClick}
                >
                    Получить бесплатную консультацию
                </Button>
            </div>
        </section>
    );
}
