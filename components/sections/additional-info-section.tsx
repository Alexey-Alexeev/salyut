import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function AdditionalInfoSection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Важная информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <h3 className="text-lg font-medium">
                            <span role="img" aria-label="фейерверк">🎆</span> Безопасность
                        </h3>
                        <ul className="text-muted-foreground space-y-1 text-sm">
                            <li>• Продажа только лицам старше 18 лет</li>
                            <li>• Соблюдение правил перевозки пиротехники</li>
                            <li>• Сертифицированная продукция</li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-lg font-medium">
                            <span role="img" aria-label="поддержка">📞</span> Поддержка
                        </h3>
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
                        <span role="img" aria-label="звезда">💫</span> Хотите особенное шоу?
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
    );
}
