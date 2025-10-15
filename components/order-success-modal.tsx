'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShoppingBag, Clock, MessageCircle, Home, Phone, Send } from 'lucide-react';

interface OrderSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerName?: string;
    totalAmount?: number;
    deliveryMethod?: string;
}

export function OrderSuccessModal({
    isOpen,
    onClose,
    customerName,
    totalAmount,
    deliveryMethod
}: OrderSuccessModalProps) {
    const router = useRouter();

    // Блокируем скролл когда модальное окно открыто
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleContinueShopping = () => {
        onClose();
        router.push('/catalog');
    };

    const handleGoHome = () => {
        onClose();
        router.push('/');
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md w-full mx-2 sm:mx-0 max-h-[95vh] overflow-y-auto">
                <DialogHeader className="text-center space-y-2 sm:space-y-3">
                    <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <DialogTitle className="text-base sm:text-lg font-bold text-gray-900">
                        Заказ успешно оформлен!
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-gray-600">
                        Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 sm:space-y-3 py-1 sm:py-2">
                    {/* Информация о заказе - компактно */}
                    <div className="bg-gray-50 rounded-lg p-2 sm:p-3 space-y-1 sm:space-y-2">
                        {customerName && (
                            <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                <span className="text-gray-600">Клиент: {customerName}</span>
                            </div>
                        )}

                        {totalAmount && (
                            <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                <span className="text-gray-500">💰</span>
                                <span className="text-gray-600">Сумма: {formatPrice(totalAmount)}</span>
                            </div>
                        )}

                        {deliveryMethod && (
                            <div className="flex items-center space-x-2 text-xs sm:text-sm">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                                <span className="text-gray-600">
                                    Доставка: {deliveryMethod === 'delivery' ? 'Курьером' : 'Самовывоз'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Что дальше - компактно */}
                    <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                        <h3 className="font-semibold text-blue-900 mb-1 text-xs sm:text-sm">Что дальше?</h3>
                        <ul className="text-xs text-blue-800 space-y-0.5">
                            <li>• Обработаем заказ как можно скорее</li>
                            <li>• Свяжемся для подтверждения деталей</li>
                            <li>• Подготовим и отправим заказ</li>
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
                        <span className="text-sm sm:text-base">Продолжить покупки</span>
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

                {/* Контакты в стиле модального окна консультации */}
                <div className="mt-2 sm:mt-4 border-t pt-2 sm:pt-4">
                    <p className="text-muted-foreground mb-2 sm:mb-3 text-center text-xs sm:text-sm">
                        Есть вопросы? Свяжитесь с нами напрямую
                    </p>
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {/* Телефон */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex flex-1 items-center gap-1 sm:gap-2 h-8 sm:h-9"
                            onClick={() => window.open('tel:+79773602008')}
                        >
                            <Phone className="size-3 sm:size-4" />
                            <span className="text-xs sm:text-sm">Телефон</span>
                        </Button>

                        {/* WhatsApp */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex flex-1 items-center gap-1 sm:gap-2 h-8 sm:h-9"
                            onClick={() => window.open('https://wa.me/79773602008')}
                        >
                            <MessageCircle className="size-3 sm:size-4" />
                            <span className="text-xs sm:text-sm">WhatsApp</span>
                        </Button>

                        {/* Telegram */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex flex-1 items-center gap-1 sm:gap-2 h-8 sm:h-9"
                            onClick={() => window.open('https://t.me/+79773602008')}
                        >
                            <Send className="size-3 sm:size-4" />
                            <span className="text-xs sm:text-sm">Telegram</span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
