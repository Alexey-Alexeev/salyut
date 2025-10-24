import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import YandexMapEmbedWithFallback from '@/components/yandex-map-embed';

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
                    {/* Yandex Map Embed */}
                    <YandexMapEmbedWithFallback
                        height="400px"
                        className="w-full"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
