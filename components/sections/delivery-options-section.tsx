import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Truck,
    Store,
    MapPin,
    Phone,
    Calculator,
    Info,
    CheckCircle,
} from 'lucide-react';
import { DELIVERY_CONSTANTS, formatDeliveryCost } from '@/lib/delivery-utils';

export function DeliveryOptionsSection() {
    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Доставка */}
            <Card className="relative overflow-hidden">
                <div className="absolute right-4 top-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Популярно
                    </Badge>
                </div>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                            <Truck className="size-6 text-blue-600" aria-hidden="true" />
                        </div>
                        <span role="img" aria-label="доставка">🚚</span> Доставка
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                            <CheckCircle className="size-5 shrink-0 text-green-600" aria-hidden="true" />
                            <div>
                                <p className="font-medium text-green-900">
                                    Москва, Балашиха, Люберцы
                                </p>
                                <p className="text-sm text-green-700">
                                    Фиксированная стоимость:{' '}
                                    <strong>
                                        {formatDeliveryCost(
                                            DELIVERY_CONSTANTS.MOSCOW_DELIVERY_COST
                                        )}
                                    </strong>
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                            <Calculator className="size-5 shrink-0 text-blue-600" aria-hidden="true" />
                            <div>
                                <p className="font-medium text-blue-900">
                                    Другие города Московской области
                                </p>
                                <p className="text-sm text-blue-700">
                                    <strong>{DELIVERY_CONSTANTS.COST_PER_KM} ₽ за км</strong>{' '}
                                    от МКАД
                                </p>
                                <p className="text-xs text-blue-600">
                                    Минимальная стоимость:{' '}
                                    {formatDeliveryCost(DELIVERY_CONSTANTS.MIN_DELIVERY_COST)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-medium">
                            <Info className="size-4" aria-hidden="true" />
                            Условия доставки:
                        </h4>
                        <ul className="text-muted-foreground ml-6 space-y-1 text-sm">
                            <li>• Доставка осуществляется в течение 1-3 дней</li>
                            <li>• Время доставки согласовывается с менеджером</li>
                            <li>• Оплата при получении (наличные или карта)</li>
                            <li>• Обязательна проверка документов (18+)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Самовывоз */}
            <Card className="relative overflow-hidden">
                <div className="absolute right-4 top-4">
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                    >
                        Бесплатно
                    </Badge>
                </div>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-2">
                            <Store className="size-6 text-green-600" aria-hidden="true" />
                        </div>
                        <span role="img" aria-label="самовывоз">🏬</span> Самовывоз
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-3 rounded-lg bg-green-50 p-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" />
                            <div>
                                <h4 className="font-medium text-green-900">
                                    Адрес склада:
                                </h4>
                                <p className="text-sm leading-relaxed text-green-800">
                                    {DELIVERY_CONSTANTS.PICKUP_ADDRESS.fullAddress}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="size-5 shrink-0 text-green-600" aria-hidden="true" />
                            <div>
                                <h4 className="font-medium text-green-900">Телефон:</h4>
                                <p className="text-sm text-green-800">+7 (977) 360-20-08</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h4 className="flex items-center gap-2 font-medium">
                            <Info className="size-4" aria-hidden="true" />
                            Условия самовывоза:
                        </h4>
                        <ul className="text-muted-foreground ml-6 space-y-1 text-sm">
                            <li>• Предварительно позвоните для уточнения готовности</li>
                            <li>• Возьмите с собой документ, удостоверяющий личность</li>
                            <li>• Проверьте товар при получении</li>
                            <li>• Оплата наличными или картой на месте</li>
                            <li>• Парковка доступна возле склада</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
