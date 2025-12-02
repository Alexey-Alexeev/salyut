import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ExternalLink } from 'lucide-react';
import YandexMapWithFallback from '@/components/yandex-map';

export function MapSection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2">
                        <MapPin className="size-6 text-slate-600" aria-hidden="true" />
                    </div>
                    Расположение склада
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Yandex Map */}
                    <YandexMapWithFallback
                        height="400px"
                        className="w-full"
                        showControls={true}
                        zoom={15}
                    />
                    {/* Button to open in Yandex Maps */}
                    <div className="flex justify-center">
                        <Button
                            asChild
                            variant="outline"
                            className="w-full sm:w-auto"
                        >
                            <a
                                href="https://yandex.ru/maps/-/CLcT4Xz6"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                Перейти в Яндекс Карты
                                <ExternalLink className="size-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
