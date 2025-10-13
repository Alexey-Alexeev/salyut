'use client';

import { DeliverySelection } from '@/components/delivery-selection';
import { type DeliveryCalculationResult } from '@/lib/delivery-utils';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const orderSchema = z
    .object({
        name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
        contactMethod: z.string().min(1, 'Выберите способ связи').refine(
            val => ['phone', 'telegram', 'whatsapp'].includes(val),
            { message: 'Выберите способ связи' }
        ),
        contact: z.string().optional(),
        comment: z.string().optional(),
        professionalLaunch: z.boolean().optional(),
        deliveryMethod: z.enum(['delivery', 'pickup']),
        deliveryAddress: z.string().optional(),
        ageConfirmed: z.boolean().refine(val => val === true, {
            message: 'Необходимо подтвердить возраст',
        }),
    })
    .refine(
        data => {
            if (!data.contactMethod) {
                return true; // Не валидируем contact если не выбран способ связи
            }
            if (!data.contact || data.contact.trim().length === 0) {
                return false;
            }
            return true;
        },
        {
            message: 'Укажите контактную информацию',
            path: ['contact'],
        }
    )

type OrderFormData = z.infer<typeof orderSchema>;

// Пороги для скидок
const DISCOUNT_THRESHOLD_1 = 40000; // 5% discount + подарок
const DISCOUNT_THRESHOLD_2 = 60000; // 10% discount + подарок
const GIFT_THRESHOLD = 10000; // подарок от 10000

export default function CartPageClient() {
    const { items, updateQuantity, removeItem, clearCart, getTotalPrice, isInitialized } =
        useCartStore();
    const [deliveryResult, setDeliveryResult] =
        useState<DeliveryCalculationResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasValidationAttempted, setHasValidationAttempted] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const router = useRouter();

    // Hydration check to prevent server-client mismatch
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors, ...formState },
    } = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: {
            deliveryMethod: 'delivery',
            ageConfirmed: false,
        },
    });


    const deliveryMethod = watch('deliveryMethod');
    const professionalLaunch = watch('professionalLaunch');

    // Рассчитываем скидку
    const subtotal = getTotalPrice();
    let discount = 0;
    let discountPercent = 0;
    let hasGift = false;

    if (subtotal >= DISCOUNT_THRESHOLD_2) {
        discountPercent = 10;
        discount = Math.round(subtotal * 0.1);
        hasGift = true;
    } else if (subtotal >= DISCOUNT_THRESHOLD_1) {
        discountPercent = 5;
        discount = Math.round(subtotal * 0.05);
        hasGift = true;
    } else if (subtotal >= GIFT_THRESHOLD) {
        hasGift = true;
    }

    const deliveryCost = deliveryResult?.cost || 0;
    const total = subtotal - discount + deliveryCost;

    const onDeliveryChange = useCallback(
        (result: DeliveryCalculationResult) => {
            setDeliveryResult(result);

            // Синхронизируем метод доставки с формой
            setValue('deliveryMethod', result.method);

            // Синхронизируем адрес с формой
            if (result.address) {
                setValue('deliveryAddress', result.address);
            } else {
                // Если метод доставки, но адреса нет - очищаем поле
                if (result.method === 'delivery') {
                    setValue('deliveryAddress', '');
                }
            }
        },
        [setValue]
    );

    // Функция для показа ошибок валидации
    const showValidationErrors = (errors: any) => {
        const errorMessages: string[] = [];

        if (errors.name) {
            errorMessages.push(`• ${errors.name.message}`);
        }
        if (errors.contactMethod) {
            errorMessages.push(`• ${errors.contactMethod.message}`);
        }
        if (errors.contact) {
            errorMessages.push(`• ${errors.contact.message}`);
        }
        if (errors.ageConfirmed) {
            errorMessages.push(`• ${errors.ageConfirmed.message}`);
        }

        if (errorMessages.length > 0) {
            toast.error(
                <div>
                    <div className="font-semibold mb-2">Пожалуйста, исправьте ошибки:</div>
                    <div className="text-sm space-y-1">
                        {errorMessages.map((msg, index) => (
                            <div key={index}>{msg}</div>
                        ))}
                    </div>
                </div>,
                { duration: 5000 }
            );
        }
    };

    const onSubmit = async (data: OrderFormData) => {
        if (items.length === 0) {
            toast.error(
                <div>
                    <div className="font-semibold">🛒 Корзина пуста</div>
                    <div className="text-sm mt-1">Добавьте товары в корзину для оформления заказа</div>
                </div>,
                { duration: 3000 }
            );
            return;
        }

        // Проверяем ошибки валидации
        if (Object.keys(errors).length > 0) {
            showValidationErrors(errors);
            return;
        }

        setIsSubmitting(true);

        try {
            // Автоматически добавляем @ для Telegram контактов
            let processedContact = data.contact || null;
            if (data.contactMethod === 'telegram' && processedContact && !processedContact.startsWith('@')) {
                processedContact = '@' + processedContact;
            }

            const orderData = {
                customer_name: data.name,
                customer_contact: processedContact,
                contact_method: data.contactMethod,
                comment: data.comment || null,
                total_amount: Math.round(total),
                delivery_cost: Math.round(deliveryCost),
                discount_amount: Math.round(discount),
                age_confirmed: data.ageConfirmed,
                professional_launch_requested: data.professionalLaunch || false,
                delivery_method: data.deliveryMethod,
                delivery_address: data.deliveryAddress || null,
                distance_from_mkad: deliveryResult?.distanceFromMKAD || null,
                items: items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price_at_time: Math.round(item.price),
                })),
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                toast.success(
                    <div>
                        <div className="font-semibold">🎉 Заказ успешно оформлен!</div>
                        <div className="text-sm mt-1">Мы свяжемся с вами в ближайшее время</div>
                    </div>,
                    { duration: 4000 }
                );
                clearCart();
                // Перенаправляем на страницу успеха или главную
                router.push('/');
            } else {
                const errorData = await response.json();

                // Показываем детальные ошибки валидации с сервера
                if (errorData.details && Array.isArray(errorData.details)) {
                    const serverErrors = errorData.details.map((detail: any) => `• ${detail.message}`).join('\n');
                    toast.error(
                        <div>
                            <div className="font-semibold mb-2">Ошибка валидации:</div>
                            <div className="text-sm whitespace-pre-line">{serverErrors}</div>
                        </div>,
                        { duration: 6000 }
                    );
                } else {
                    toast.error(errorData.message || 'Ошибка при оформлении заказа');
                }
            }
        } catch (error) {
            toast.error(
                <div>
                    <div className="font-semibold">⚠️ Ошибка соединения</div>
                    <div className="text-sm mt-1">Проверьте подключение к интернету и попробуйте снова</div>
                </div>,
                { duration: 5000 }
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    // Не рендерим до монтирования и инициализации store, чтобы избежать hydration mismatch
    if (!isMounted || !isInitialized) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Breadcrumb
                        items={[
                            { href: '/catalog', label: 'Каталог' },
                            { label: 'Корзина' },
                        ]}
                    />
                </div>
                <div className="flex h-64 items-center justify-center">
                    <div className="text-center">
                        <div className="mb-4 text-6xl opacity-50">🛒</div>
                        <div className="text-lg font-medium text-gray-600">
                            Загрузка корзины...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Breadcrumb items={[{ label: 'Корзина' }]} />
                </div>

                <div className="mx-auto max-w-2xl text-center">
                    <div className="mb-8">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                            <svg
                                className="h-12 w-12 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                                />
                            </svg>
                        </div>
                        <h1 className="mb-4 text-3xl font-bold">Корзина пуста</h1>
                        <p className="mb-8 text-gray-600">
                            Добавьте товары в корзину, чтобы оформить заказ фейерверков и салютов
                        </p>
                        <Link href="/catalog">
                            <Button size="lg">Перейти к каталогу</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 py-4 sm:px-4 sm:py-8">
            <div className="mb-4 sm:mb-8 px-2 sm:px-0">
                <Breadcrumb items={[{ label: 'Корзина' }]} />
            </div>

            <div className="mx-auto max-w-6xl px-0 sm:px-6 lg:px-8">
                <h1 className="mb-4 sm:mb-8 text-xl font-bold sm:text-2xl lg:text-3xl px-2 sm:px-0">Корзина - Оформление заказа</h1>

                <div className="grid gap-3 sm:gap-6 lg:gap-8 lg:grid-cols-5">
                    {/* Товары в корзине */}
                    <div className="lg:col-span-3 lg:order-1">
                        <Card>
                            <CardHeader className="p-3 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Товары в корзине</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 p-3 sm:p-6 sm:space-y-4">
                                {items.map(item => (
                                    <div
                                        key={item.id}
                                        className="relative flex flex-col gap-2 rounded-lg border p-2 sm:gap-4 sm:p-4 sm:flex-row sm:items-center"
                                    >
                                        {/* Информация о товаре */}
                                        <div className="flex items-start gap-2 flex-1 min-w-0 sm:gap-4 sm:items-center">
                                            <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
                                                <Image
                                                    src={item.image || '/images/placeholder.jpg'}
                                                    alt={item.name}
                                                    fill
                                                    className="rounded-lg object-cover"
                                                    sizes="(max-width: 640px) 64px, 80px"
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0 pr-8 sm:pr-0">
                                                <h3 className="font-semibold text-sm leading-tight mb-1 sm:text-base sm:mb-0">{item.name}</h3>
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    {item.price.toLocaleString('ru-RU')} ₽ за шт.
                                                </p>
                                            </div>

                                            {/* Кнопка удаления (мобильная - в правом верхнем углу) */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0 shrink-0 absolute right-2 top-2 sm:hidden"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 sm:flex-row sm:gap-4 sm:items-center">
                                            {/* Элементы управления количеством */}
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.quantity - 1)
                                                    }
                                                    disabled={item.quantity <= 1}
                                                    className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center p-0 shrink-0"
                                                >
                                                    <Minus className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" style={{ transform: 'translateY(1px)' }} />
                                                </Button>
                                                <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() =>
                                                        updateQuantity(item.id, item.quantity + 1)
                                                    }
                                                    className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center p-0 shrink-0"
                                                >
                                                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                                                </Button>
                                            </div>

                                            {/* Цена */}
                                            <div className="text-right min-w-[80px] sm:min-w-[100px]">
                                                <p className="font-semibold text-sm sm:text-base whitespace-nowrap">
                                                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                                                </p>
                                            </div>

                                            {/* Кнопка удаления (десктоп) */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 shrink-0 hidden sm:flex"
                                            >
                                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Форма заказа */}
                    <div className="lg:col-span-2 lg:order-2 space-y-3 sm:space-y-6">
                        {/* Итого сумма товаров */}
                        <Card>
                            <CardHeader className="p-3 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Итого сумма товаров</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                                <div className="flex justify-between text-sm sm:text-base">
                                    <span>Товары:</span>
                                    <span className="font-medium">{subtotal.toLocaleString('ru-RU')} ₽</span>
                                </div>

                                {subtotal < GIFT_THRESHOLD && (
                                    <div className="rounded-lg bg-orange-50 p-2.5 sm:p-3">
                                        <div className="mb-2">
                                            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                                                <span className="text-xs sm:text-sm font-medium text-orange-800">
                                                    До подарка:
                                                </span>
                                                <span className="text-xs sm:text-sm font-semibold text-orange-800">
                                                    {Math.max(0, GIFT_THRESHOLD - subtotal).toLocaleString('ru-RU')} ₽
                                                </span>
                                            </div>
                                            <div className="w-full bg-orange-200 rounded-full h-2">
                                                <div
                                                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(100, (subtotal / GIFT_THRESHOLD) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-orange-700 mt-1">
                                                Вы набрали {subtotal.toLocaleString('ru-RU')} ₽ из {GIFT_THRESHOLD.toLocaleString('ru-RU')} ₽
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {subtotal >= GIFT_THRESHOLD && subtotal < DISCOUNT_THRESHOLD_1 && (
                                    <div className="rounded-lg bg-blue-50 p-2.5 sm:p-3">
                                        <div className="mb-2">
                                            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                                                <span className="text-xs sm:text-sm font-medium text-blue-800">
                                                    До скидки 5%:
                                                </span>
                                                <span className="text-xs sm:text-sm font-semibold text-blue-800">
                                                    {Math.max(0, DISCOUNT_THRESHOLD_1 - subtotal).toLocaleString('ru-RU')} ₽
                                                </span>
                                            </div>
                                            <div className="w-full bg-blue-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(100, ((subtotal - GIFT_THRESHOLD) / (DISCOUNT_THRESHOLD_1 - GIFT_THRESHOLD)) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-blue-700 mt-1">
                                                Вы набрали {subtotal.toLocaleString('ru-RU')} ₽ из {DISCOUNT_THRESHOLD_1.toLocaleString('ru-RU')} ₽
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {subtotal >= DISCOUNT_THRESHOLD_1 && subtotal < DISCOUNT_THRESHOLD_2 && (
                                    <div className="rounded-lg bg-green-50 p-2.5 sm:p-3">
                                        <div className="mb-2">
                                            <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                                                <span className="text-xs sm:text-sm font-medium text-green-800">
                                                    До скидки 10%:
                                                </span>
                                                <span className="text-xs sm:text-sm font-semibold text-green-800">
                                                    {Math.max(0, DISCOUNT_THRESHOLD_2 - subtotal).toLocaleString('ru-RU')} ₽
                                                </span>
                                            </div>
                                            <div className="w-full bg-green-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${Math.min(100, ((subtotal - DISCOUNT_THRESHOLD_1) / (DISCOUNT_THRESHOLD_2 - DISCOUNT_THRESHOLD_1)) * 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-green-700 mt-1">
                                                Вы набрали {subtotal.toLocaleString('ru-RU')} ₽ из {DISCOUNT_THRESHOLD_2.toLocaleString('ru-RU')} ₽
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {hasGift && (
                                    <div className="flex justify-between text-purple-600 text-sm sm:text-base">
                                        <span>🎁 Подарок:</span>
                                        <span className="font-medium">Включен</span>
                                    </div>
                                )}

                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600 text-sm sm:text-base">
                                        <span>Скидка {discountPercent}%:</span>
                                        <span className="font-medium">-{discount.toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                )}

                                <div className="border-t pt-3 sm:pt-4">
                                    <div className="flex justify-between font-semibold text-base sm:text-lg">
                                        <span>Итого товары:</span>
                                        <span>{(subtotal - discount).toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Форма оформления заказа */}
                        <Card>
                            <CardHeader className="p-3 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Оформление заказа</CardTitle>
                            </CardHeader>
                            <CardContent className="px-3 sm:px-6 py-3 sm:py-6">
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                                    {/* Контактная информация */}
                                    <div className="space-y-3 sm:space-y-4">
                                        <h3 className="text-base sm:text-lg font-semibold">
                                            Контактная информация
                                        </h3>

                                        <div className={`p-2 rounded-md ${(errors.name || (!watch('name') && hasValidationAttempted)) ? 'bg-red-50 border border-red-200' : ''}`}>
                                            <Label htmlFor="name" className={`${(errors.name || (!watch('name') && hasValidationAttempted)) ? 'text-red-600' : ''}`}>Имя *</Label>
                                            <Input
                                                id="name"
                                                {...register('name')}
                                                className={`w-full ${(errors.name || (!watch('name') && hasValidationAttempted)) ? 'border-red-500 bg-red-50' : ''}`}
                                                placeholder="Введите ваше имя"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className={`p-2 rounded-md ${(errors.contactMethod || (!watch('contactMethod') && hasValidationAttempted)) ? 'bg-red-50 border border-red-200' : ''}`}>
                                            <Label htmlFor="contactMethod" className={`${(errors.contactMethod || (!watch('contactMethod') && hasValidationAttempted)) ? 'text-red-600' : ''}`}>
                                                Способ связи *
                                            </Label>
                                            <Select
                                                value={watch('contactMethod') || ''}
                                                onValueChange={value =>
                                                    setValue('contactMethod', value as 'phone' | 'telegram' | 'whatsapp')
                                                }
                                            >
                                                <SelectTrigger className={(errors.contactMethod || (!watch('contactMethod') && hasValidationAttempted)) ? 'border-red-500 bg-red-50' : ''}>
                                                    <SelectValue placeholder="Выберите способ связи" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="phone">Телефон</SelectItem>
                                                    <SelectItem value="telegram">Telegram</SelectItem>
                                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.contactMethod && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.contactMethod.message}
                                                </p>
                                            )}
                                        </div>

                                        {watch('contactMethod') && (
                                            <div>
                                                <Label htmlFor="contact">Контакт *</Label>
                                                <Input
                                                    id="contact"
                                                    {...register('contact')}
                                                    placeholder={
                                                        watch('contactMethod') === 'telegram'
                                                            ? '@username'
                                                            : watch('contactMethod') === 'whatsapp'
                                                                ? '+7 (999) 123-45-67'
                                                                : '+7 (999) 123-45-67'
                                                    }
                                                    className={errors.contact ? 'border-red-500 bg-red-50' : ''}
                                                    onKeyDown={(e) => {
                                                        // Разрешаем только цифры, +, -, (, ), пробел для телефона и WhatsApp
                                                        if (watch('contactMethod') === 'phone' || watch('contactMethod') === 'whatsapp') {
                                                            const allowedKeys = [
                                                                'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
                                                                'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                                                                'Home', 'End'
                                                            ];
                                                            const allowedChars = /[0-9+\-() ]/;

                                                            if (!allowedKeys.includes(e.key) && !allowedChars.test(e.key)) {
                                                                e.preventDefault();
                                                            }
                                                        }
                                                    }}
                                                    onInput={(e) => {
                                                        // Дополнительная проверка для очистки недопустимых символов
                                                        if (watch('contactMethod') === 'phone' || watch('contactMethod') === 'whatsapp') {
                                                            const target = e.target as HTMLInputElement;
                                                            const value = target.value;
                                                            const cleanedValue = value.replace(/[^0-9+\-() ]/g, '');
                                                            if (value !== cleanedValue) {
                                                                target.value = cleanedValue;
                                                                setValue('contact', cleanedValue);
                                                            }
                                                        }
                                                    }}
                                                />
                                                {errors.contact && (
                                                    <p className="mt-1 text-sm text-red-500">
                                                        {errors.contact.message}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Доставка */}
                                    <div className="space-y-3 sm:space-y-4">
                                        <h3 className="text-base sm:text-lg font-semibold">Доставка</h3>

                                        <DeliverySelection
                                            onDeliveryChange={onDeliveryChange}
                                        />

                                        {/* Скрытое поле для адреса доставки */}
                                        <input
                                            type="hidden"
                                            {...register('deliveryAddress')}
                                        />

                                    </div>

                                    {/* Дополнительные услуги */}
                                    <div className="space-y-3 sm:space-y-4">
                                        <h3 className="text-base sm:text-lg font-semibold">
                                            Дополнительные услуги
                                        </h3>

                                        {/* Профессиональный запуск */}
                                        <div className="rounded-lg border bg-gradient-to-r from-orange-50 to-red-50 p-3 sm:p-4">
                                            <div className="flex items-start gap-2 sm:gap-3">
                                                <Checkbox
                                                    id="professionalLaunch"
                                                    checked={watch('professionalLaunch') === true}
                                                    onCheckedChange={(checked) => setValue('professionalLaunch', checked as boolean)}
                                                    className="mt-0.5"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                                                        <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-purple-100 shrink-0">
                                                            <span className="text-xs sm:text-sm">🎆</span>
                                                        </div>
                                                        <Label
                                                            htmlFor="professionalLaunch"
                                                            className="cursor-pointer text-xs sm:text-sm font-medium leading-tight"
                                                        >
                                                            Профессиональный запуск салютов
                                                        </Label>
                                                    </div>
                                                    <p className="text-muted-foreground text-[10px] sm:text-xs leading-relaxed">
                                                        Безопасно, качественно, с соблюдением всех норм.<br />
                                                        Стоимость рассчитывается индивидуально.
                                                    </p>
                                                    <Link
                                                        href="/services/launching"
                                                        className="text-[10px] sm:text-xs text-orange-600 underline hover:text-orange-700 mt-1.5 sm:mt-2 inline-block"
                                                    >
                                                        Подробнее об услуге →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Комментарий */}
                                    <div>
                                        <Label htmlFor="comment">Комментарий к заказу</Label>
                                        <Textarea
                                            id="comment"
                                            {...register('comment')}
                                            placeholder="Дополнительные пожелания..."
                                            rows={3}
                                        />
                                    </div>

                                    {/* Подтверждение возраста и согласие на обработку данных */}
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className={`flex items-center gap-2 p-2 rounded-md ${(errors.ageConfirmed || (!watch('ageConfirmed') && hasValidationAttempted)) ? 'bg-red-50 border border-red-200' : ''}`}>
                                            <Checkbox
                                                id="ageConfirmed"
                                                checked={watch('ageConfirmed')}
                                                onCheckedChange={(checked) => setValue('ageConfirmed', checked as boolean)}
                                                className={(errors.ageConfirmed || (!watch('ageConfirmed') && hasValidationAttempted)) ? 'border-red-500 mt-0.5 shrink-0' : 'mt-0.5 shrink-0'}
                                            />
                                            <Label htmlFor="ageConfirmed" className={`text-xs sm:text-sm leading-tight ${(errors.ageConfirmed || (!watch('ageConfirmed') && hasValidationAttempted)) ? 'text-red-600' : ''}`}>
                                                Подтверждаю, что мне исполнилось 18 лет *
                                            </Label>
                                        </div>
                                        {errors.ageConfirmed && (
                                            <p className="text-xs sm:text-sm text-red-500">
                                                {errors.ageConfirmed.message}
                                            </p>
                                        )}

                                        <div className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
                                            Согласен на обработку персональных данных в соответствии с{' '}
                                            <Link
                                                href="/privacy"
                                                className="text-orange-600 hover:text-orange-700 underline"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                политикой конфиденциальности
                                            </Link>
                                        </div>
                                    </div>

                                </form>
                            </CardContent>
                        </Card>

                        {/* Итоги заказа */}
                        <Card>
                            <CardHeader className="p-3 sm:p-6">
                                <CardTitle className="text-base sm:text-lg">Итоги заказа</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-6">
                                <div className="flex justify-between text-sm sm:text-base">
                                    <span>Товары:</span>
                                    <span className="font-medium">{subtotal.toLocaleString('ru-RU')} ₽</span>
                                </div>

                                <div className="flex justify-between text-sm sm:text-base">
                                    <span>Доставка:</span>
                                    <span className="font-medium">{deliveryCost > 0 ? `${deliveryCost.toLocaleString('ru-RU')} ₽` : 'Бесплатно'}</span>
                                </div>

                                {hasGift && (
                                    <div className="flex justify-between text-purple-600 text-sm sm:text-base">
                                        <span>🎁 Подарок:</span>
                                        <span className="font-medium">Включен</span>
                                    </div>
                                )}

                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600 text-sm sm:text-base">
                                        <span>Скидка {discountPercent}%:</span>
                                        <span className="font-medium">-{discount.toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                )}

                                <Separator />

                                <div className="flex justify-between font-semibold text-base sm:text-lg">
                                    <span>Итого к оплате:</span>
                                    <span>{total.toLocaleString('ru-RU')} ₽</span>
                                </div>

                                <Button
                                    type="button"
                                    className="w-full text-sm sm:text-base"
                                    size="lg"
                                    disabled={isSubmitting}
                                    onClick={() => {
                                        setHasValidationAttempted(true);
                                        const currentFormValues = watch();

                                        // Проверяем ошибки валидации перед отправкой
                                        if (Object.keys(errors).length > 0) {
                                            showValidationErrors(errors);
                                            return;
                                        }

                                        // Дополнительная проверка критических полей
                                        const criticalErrors: any = {};

                                        if (!currentFormValues.name || currentFormValues.name.trim().length < 2) {
                                            criticalErrors.name = { message: 'Имя должно содержать минимум 2 символа' };
                                        }

                                        if (!currentFormValues.contactMethod) {
                                            criticalErrors.contactMethod = { message: 'Выберите способ связи' };
                                        }

                                        if (!currentFormValues.ageConfirmed) {
                                            criticalErrors.ageConfirmed = { message: 'Необходимо подтвердить возраст' };
                                        }

                                        if (currentFormValues.contactMethod && (!currentFormValues.contact || currentFormValues.contact.trim() === '')) {
                                            criticalErrors.contact = { message: 'Укажите контакт для связи' };
                                        }

                                        if (Object.keys(criticalErrors).length > 0) {
                                            showValidationErrors(criticalErrors);
                                            return;
                                        }

                                        handleSubmit(onSubmit)();
                                    }}
                                >
                                    {isSubmitting ? (
                                        'Оформляем заказ...'
                                    ) : (
                                        <>
                                            <Check className="mr-1.5 sm:mr-2 h-4 w-4" aria-hidden="true" />
                                            Оформить заказ
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>


            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Корзина - Фейерверки и салюты",
                        "description": "Оформление заказа фейерверков и салютов. Быстрая доставка по Москве и МО. Профессиональный запуск салютов.",
                        "url": "https://салютград.рф/cart",
                        "breadcrumb": {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Главная",
                                    "item": "https://салютград.рф"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Корзина",
                                    "item": "https://салютград.рф/cart"
                                }
                            ]
                        },
                        "mainEntity": {
                            "@type": "ShoppingCart",
                            "name": "Корзина покупок",
                            "description": "Корзина для оформления заказа фейерверков и салютов",
                            "merchant": {
                                "@type": "Organization",
                                "name": "СалютГрад",
                                "url": "https://салютград.рф",
                                "telephone": "+7 (977) 360-20-08",
                                "address": {
                                    "@type": "PostalAddress",
                                    "streetAddress": "Рассветная улица, 14",
                                    "addressLocality": "деревня Чёрное",
                                    "addressRegion": "Московская область",
                                    "addressCountry": "RU",
                                    "postalCode": "143921"
                                },
                                "geo": {
                                    "@type": "GeoCoordinates",
                                    "latitude": "55.740340",
                                    "longitude": "38.054064"
                                },
                                "openingHours": "Mo-Su 09:00-21:00",

                            },
                            "itemListElement": items.map((item, index) => ({
                                "@type": "ListItem",
                                "position": index + 1,
                                "item": {
                                    "@type": "Product",
                                    "name": item.name,
                                    "description": `Фейерверк ${item.name}`,
                                    "image": item.image || "https://салютград.рф/images/product-placeholder.jpg",
                                    "offers": {
                                        "@type": "Offer",
                                        "price": item.price,
                                        "priceCurrency": "RUB",
                                        "availability": "https://schema.org/InStock",
                                        "seller": {
                                            "@type": "Organization",
                                            "name": "СалютГрад"
                                        }
                                    }
                                }
                            })),
                            "potentialAction": [
                                {
                                    "@type": "BuyAction",
                                    "target": "https://салютград.рф/cart",
                                    "priceSpecification": {
                                        "@type": "PriceSpecification",
                                        "priceCurrency": "RUB",
                                        "price": total.toString()
                                    }
                                }
                            ]
                        }
                    })
                }}
            />
        </div>
    );
}
