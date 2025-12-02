'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, Clock, MessageCircle, Home, Phone, Send } from 'lucide-react';
import { trackConsultationSuccess } from '@/lib/metrika';

interface ConsultationSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerName?: string;
}

export function ConsultationSuccessModal({
    isOpen,
    onClose,
    customerName
}: ConsultationSuccessModalProps) {
    const router = useRouter();

    // Блокируем скролл когда модальное окно открыто
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            
            // Отправляем событие в Яндекс.Метрику о успешной консультации
            trackConsultationSuccess({
                customerName: customerName
            });
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, customerName]);

    const handleContinueShopping = () => {
        onClose();
        // Небольшая задержка для корректного закрытия модального окна
        setTimeout(() => {
            router.push('/catalog');
        }, 100);
    };

    const handleGoHome = () => {
        onClose();
        // Небольшая задержка для корректного закрытия модального окна
        setTimeout(() => {
            router.push('/');
        }, 100);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md w-full mx-2 sm:mx-0 max-h-[95vh] overflow-y-auto">
                <DialogHeader className="text-center space-y-2 sm:space-y-3">
                    <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 text-center">
                        Заявка успешно отправлена!
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-gray-600">
                        Спасибо за вашу заявку! Мы свяжемся с вами в ближайшее время для консультации.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 sm:space-y-3 py-1 sm:py-2">
                    {/* Информация о заявке */}
                    {customerName && (
                        <div className="bg-gray-50 rounded-lg p-2 sm:p-3">
                            <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                <span className="text-gray-600">Клиент: {customerName}</span>
                            </div>
                        </div>
                    )}

                    {/* Что дальше */}
                    <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                        <h3 className="font-semibold text-blue-900 mb-1 text-xs sm:text-sm">Что дальше?</h3>
                        <ul className="text-xs text-blue-800 space-y-0.5">
                            <li>• Обработаем вашу заявку как можно скорее</li>
                            <li>• Свяжемся с вами для консультации</li>
                            <li>• Поможем подобрать идеальные фейерверки</li>
                        </ul>
                    </div>
                </div>

                {/* Основные кнопки */}
                <div className="space-y-2 sm:space-y-3 pt-1 sm:pt-2">
                    <Button
                        onClick={handleContinueShopping}
                        className="w-full bg-green-600 hover:bg-green-700 text-white h-10 sm:h-11"
                        size="sm"
                    >
                        <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="text-sm sm:text-base">Перейти к каталогу</span>
                    </Button>
                    <Button
                        onClick={handleGoHome}
                        variant="outline"
                        className="w-full h-10 sm:h-11"
                        size="sm"
                    >
                        <Home className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="text-sm sm:text-base">На главную</span>
                    </Button>
                </div>

                {/* Контакты */}
                <div className="mt-2 sm:mt-4 border-t pt-2 sm:pt-4">
                    <p className="text-muted-foreground mb-2 sm:mb-3 text-center text-xs sm:text-sm">
                        Есть срочные вопросы? Свяжитесь с нами напрямую
                    </p>
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {/* Телефон */}
                        <a
                            href="tel:+79773602008"
                            className="flex flex-1 items-center justify-center gap-1 sm:gap-2 h-8 sm:h-9 px-3 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-xs sm:text-sm transition-colors"
                            aria-label="Позвонить по телефону"
                        >
                            <Phone className="size-3 sm:size-4" />
                            <span>Телефон</span>
                        </a>

                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/79773602008"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-1 sm:gap-2 h-8 sm:h-9 px-3 py-2 border border-transparent bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-md text-xs sm:text-sm transition-colors shadow-sm hover:shadow-md"
                            aria-label="Написать в WhatsApp"
                        >
                            <MessageCircle className="size-3 sm:size-4" />
                            <span>WhatsApp</span>
                        </a>

                        {/* Telegram */}
                        <a
                            href="https://t.me/+79773602008"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-1 items-center justify-center gap-1 sm:gap-2 h-8 sm:h-9 px-3 py-2 border border-transparent bg-[#0088cc] hover:bg-[#0077B5] text-white rounded-md text-xs sm:text-sm transition-colors shadow-sm hover:shadow-md"
                            aria-label="Написать в Telegram"
                        >
                            <Send className="size-3 sm:size-4" />
                            <span>Telegram</span>
                        </a>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
