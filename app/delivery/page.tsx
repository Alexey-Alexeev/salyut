import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import YandexMapWithFallback from '../../components/yandex-map';
import {
  Truck,
  Store,
  MapPin,
  Clock,
  Phone,
  Calculator,
  Info,
  CheckCircle,
} from 'lucide-react';
import { DELIVERY_CONSTANTS, formatDeliveryCost } from '@/lib/delivery-utils';

export const metadata: Metadata = {
  title: 'Доставка и самовывоз | КупитьСалюты.рф',
  description:
    'Информация о доставке фейерверков по Москве и Московской области. Условия доставки, стоимость, адрес самовывоза.',
  keywords:
    'доставка фейерверков, самовывоз салютов, доставка по москве, московская область',
};

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Breadcrumb items={[{ label: 'Доставка и самовывоз' }]} />
      </div>

      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Доставка и самовывоз</h1>
          <p className="text-muted-foreground text-xl">
            Мы работаем только в Москве и Московской области
          </p>
        </div>

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
                  <Truck className="size-6 text-blue-600" />
                </div>
                🚚 Доставка
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
                  <CheckCircle className="size-5 shrink-0 text-green-600" />
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
                  <Calculator className="size-5 shrink-0 text-blue-600" />
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
                  <Info className="size-4" />
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
                  <Store className="size-6 text-green-600" />
                </div>
                🏬 Самовывоз
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 rounded-lg bg-green-50 p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-green-600" />
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
                  <Phone className="size-5 shrink-0 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Телефон:</h4>
                    <p className="text-sm text-green-800">+7 (977) 360-20-08</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 font-medium">
                  <Info className="size-4" />
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

        {/* Карта */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2">
                <MapPin className="size-6 text-slate-600" />
              </div>
              Расположение склада
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Yandex Map */}
              <YandexMapWithFallback
                height="384px"
                className="w-full"
                showControls={true}
                zoom={15}
              />
            </div>
          </CardContent>
        </Card>

        {/* Дополнительная информация */}
        <Card>
          <CardHeader>
            <CardTitle>Важная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-lg font-medium">🎆 Безопасность</h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Продажа только лицам старше 18 лет</li>
                  <li>• Соблюдение правил перевозки пиротехники</li>
                  <li>• Сертифицированная продукция</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-medium">📞 Поддержка</h3>
                <ul className="text-muted-foreground space-y-1 text-sm">
                  <li>• Консультации по выбору товаров</li>
                  <li>• Помощь с расчетом доставки</li>
                  <li>• Уведомления о готовности заказа</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div className="rounded-lg bg-gradient-to-r from-orange-50 to-red-50 p-6 text-center">
              <h3 className="mb-2 text-lg font-medium">
                💫 Хотите особенное шоу?
              </h3>
              <p className="text-muted-foreground mb-4">
                Закажите профессиональный запуск салютов! Безопасно, эффектно,
                незабываемо.
              </p>
              <a
                href="/services/launching"
                className="inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-white transition-colors hover:bg-orange-700"
              >
                Узнать подробнее →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
