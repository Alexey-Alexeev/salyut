import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CityInfoProps {
    city?: string;
}

export function CityInfo({ city }: CityInfoProps) {
    if (!city) return null;

    return (
        <Card className="mx-auto max-w-4xl border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">🎆</span>
                        <h2 className="text-2xl font-bold text-orange-800">
                            Фейерверки и салюты в {city}
                        </h2>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Доставка
                        </Badge>
                    </div>

                    <p className="text-lg text-gray-700">
                        Качественная пиротехника с быстрой доставкой в {city}.
                        Профессиональный запуск салютов для ваших праздников.
                    </p>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="text-3xl">🚚</div>
                            <h3 className="font-semibold text-orange-800">Быстрая доставка</h3>
                            <p className="text-sm text-gray-600">
                                Доставка в {city} в течение 1-3 дней
                            </p>
                        </div>

                        <div className="flex flex-col items-center space-y-2">
                            <div className="text-3xl">🎯</div>
                            <h3 className="font-semibold text-orange-800">Профессиональный запуск</h3>
                            <p className="text-sm text-gray-600">
                                Безопасный запуск салютов в {city}
                            </p>
                        </div>

                        <div className="flex flex-col items-center space-y-2">
                            <div className="text-3xl">⭐</div>
                            <h3 className="font-semibold text-orange-800">Качественная пиротехника</h3>
                            <p className="text-sm text-gray-600">
                                Только проверенные производители
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
