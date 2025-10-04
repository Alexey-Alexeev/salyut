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
        phone: z.string().min(10, 'Введите корректный номер телефона'),
        contactMethod: z.enum(['telegram', 'whatsapp']).optional(),
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
            if (data.contactMethod && !data.contact) {
                return false;
            }
            return true;
        },
        {
            message: 'Укажите контакт для связи',
            path: ['contact'],
        }
    )
    .refine(
        data => {
            if (data.deliveryMethod === 'delivery' && !data.deliveryAddress) {
                return false;
            }
            return true;
        },
        {
            message: 'Укажите адрес доставки',
            path: ['deliveryAddress'],
        }
    );

type OrderFormData = z.infer<typeof orderSchema>;

// Пороги для скидок
const DISCOUNT_THRESHOLD_1 = 10000; // 5% discount
const DISCOUNT_THRESHOLD_2 = 15000; // 10% discount

export default function CartPageClient() {
    const { items, updateQuantity, removeItem, clearCart, getTotalPrice } =
        useCartStore();
    const [deliveryResult, setDeliveryResult] =
        useState<DeliveryCalculationResult | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
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

    if (subtotal >= DISCOUNT_THRESHOLD_2) {
        discountPercent = 10;
        discount = Math.round(subtotal * 0.1);
    } else if (subtotal >= DISCOUNT_THRESHOLD_1) {
        discountPercent = 5;
        discount = Math.round(subtotal * 0.05);
    }

    const deliveryCost = deliveryResult?.cost || 0;
    const total = subtotal - discount + deliveryCost;

    const onDeliveryChange = useCallback(
        (result: DeliveryCalculationResult) => {
            setDeliveryResult(result);
        },
        []
    );

    const onSubmit = async (data: OrderFormData) => {
        if (items.length === 0) {
            toast.error('Корзина пуста');
            return;
        }

        setIsSubmitting(true);

        try {
            const orderData = {
                ...data,
                items: items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price_at_time: item.price,
                })),
                total_amount: total,
                delivery_cost: deliveryCost,
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            if (response.ok) {
                toast.success('Заказ успешно оформлен!');
                clearCart();
                // Перенаправляем на страницу успеха или главную
                router.push('/');
            } else {
                const errorData = await response.json();
                toast.error(errorData.message || 'Ошибка при оформлении заказа');
            }
        } catch (error) {
            toast.error('Произошла ошибка при оформлении заказа');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                        <Link href="/">
                            <Button size="lg">Перейти к каталогу</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <Breadcrumb items={[{ label: 'Корзина' }]} />
            </div>

            <div className="mx-auto max-w-6xl">
                <h1 className="mb-8 text-3xl font-bold">Корзина - Оформление заказа фейерверков</h1>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Товары в корзине */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Товары в корзине</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {items.map(item => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-4 rounded-lg border p-4"
                                    >
                                        <div className="relative h-20 w-20 shrink-0">
                                            <Image
                                                src={item.image || '/images/placeholder.jpg'}
                                                alt={item.name}
                                                fill
                                                className="rounded-lg object-cover"
                                                sizes="80px"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {item.price.toLocaleString('ru-RU')} ₽
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    updateQuantity(item.id, item.quantity - 1)
                                                }
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-4 w-4" aria-hidden="true" />
                                            </Button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    updateQuantity(item.id, item.quantity + 1)
                                                }
                                            >
                                                <Plus className="h-4 w-4" aria-hidden="true" />
                                            </Button>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-semibold">
                                                {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                                            </p>
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                                        </Button>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Форма заказа */}
                    <div className="space-y-6">
                        {/* Итоги заказа */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Итоги заказа</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span>Товары:</span>
                                    <span>{subtotal.toLocaleString('ru-RU')} ₽</span>
                                </div>

                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Скидка {discountPercent}%:</span>
                                        <span>-{discount.toLocaleString('ru-RU')} ₽</span>
                                    </div>
                                )}

                                <Separator />

                                <div className="flex justify-between font-semibold">
                                    <span>Итого:</span>
                                    <span>{total.toLocaleString('ru-RU')} ₽</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Форма оформления заказа */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Оформление заказа</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {/* Контактная информация */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">
                                            Контактная информация
                                        </h3>

                                        <div>
                                            <Label htmlFor="name">Имя *</Label>
                                            <Input
                                                id="name"
                                                {...register('name')}
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="phone">Телефон *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                {...register('phone')}
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            {errors.phone && (
                                                <p className="mt-1 text-sm text-red-500">
                                                    {errors.phone.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="contactMethod">
                                                Способ связи (необязательно)
                                            </Label>
                                            <Select
                                                onValueChange={value =>
                                                    setValue('contactMethod', value as 'telegram' | 'whatsapp')
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите способ связи" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="telegram">Telegram</SelectItem>
                                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {watch('contactMethod') && (
                                            <div>
                                                <Label htmlFor="contact">Контакт</Label>
                                                <Input
                                                    id="contact"
                                                    {...register('contact')}
                                                    placeholder={
                                                        watch('contactMethod') === 'telegram'
                                                            ? '@username'
                                                            : '+7 (999) 123-45-67'
                                                    }
                                                    className={errors.contact ? 'border-red-500' : ''}
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
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Доставка</h3>

                                        <DeliverySelection
                                            onDeliveryChange={onDeliveryChange}
                                        />
                                    </div>

                                    {/* Дополнительные услуги */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">
                                            Дополнительные услуги
                                        </h3>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="professionalLaunch"
                                                {...register('professionalLaunch')}
                                            />
                                            <Label htmlFor="professionalLaunch">
                                                Профессиональный запуск салютов
                                            </Label>
                                        </div>

                                        {professionalLaunch && (
                                            <div className="rounded-lg bg-orange-50 p-4">
                                                <p className="text-sm text-orange-800">
                                                    Наш менеджер свяжется с вами для обсуждения деталей
                                                    профессионального запуска и расчета стоимости.
                                                </p>
                                            </div>
                                        )}
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

                                    {/* Подтверждение возраста */}
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="ageConfirmed"
                                            {...register('ageConfirmed')}
                                        />
                                        <Label htmlFor="ageConfirmed" className="text-sm">
                                            Подтверждаю, что мне исполнилось 18 лет *
                                        </Label>
                                    </div>
                                    {errors.ageConfirmed && (
                                        <p className="text-sm text-red-500">
                                            {errors.ageConfirmed.message}
                                        </p>
                                    )}

                                    {/* Кнопка оформления заказа */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            'Оформляем заказ...'
                                        ) : (
                                            <>
                                                <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                                                Оформить заказ
                                            </>
                                        )}
                                    </Button>
                                </form>
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
                                    "streetAddress": "Рассветная улица, 4",
                                    "addressLocality": "деревня Чёрное",
                                    "addressRegion": "Московская область",
                                    "addressCountry": "RU",
                                    "postalCode": "143921"
                                },
                                "geo": {
                                    "@type": "GeoCoordinates",
                                    "latitude": "55.740401",
                                    "longitude": "38.051908"
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
