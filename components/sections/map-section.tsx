import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
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
                        height="384px"
                        className="w-full"
                        showControls={true}
                        zoom={15}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
