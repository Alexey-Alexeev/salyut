'use client';

export interface YandexMapEmbedProps {
  className?: string;
  height?: string;
  width?: string;
  src?: string;
}

export function YandexMapEmbed({
  className = '',
  height = '400px',
  width = '100%',
  src = 'https://yandex.ru/map-widget/v1/?z=12&ol=biz&oid=94416577675'
}: YandexMapEmbedProps) {
  return (
    <div className={className}>
      <iframe
        src={src}
        width={width}
        height={height}
        frameBorder="0"
        style={{ border: 'none' }}
        allowFullScreen
        title="Карта СалютГрад"
        className="w-full rounded-lg border border-gray-200"
      />
      <div className="text-muted-foreground mt-2 text-center text-xs">
        📍 Рассветная улица, 14, деревня Чёрное, Московская область<br/>
        <span className="text-blue-600">💡 Заезд со стороны ул. Лесные пруды</span>
      </div>
    </div>
  );
}

export function YandexMapEmbedWithFallback(props: YandexMapEmbedProps) {
  return (
    <div className={props.className}>
      <YandexMapEmbed {...props} />
      <noscript>
        <div
          className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-slate-100"
          style={{ height: props.height || '400px' }}
        >
          <div className="space-y-2 p-6 text-center">
            <div className="text-4xl text-slate-400">🗺️</div>
            <p className="font-medium text-slate-600">Карта недоступна</p>
            <p className="text-sm text-slate-500">
              Рассветная улица, 14, деревня Чёрное, Московская область<br/>
              <span className="text-blue-600">💡 Заезд со стороны ул. Лесные пруды</span>
            </p>
            <a
              href="https://yandex.ru/maps/?text=Рассветная%20улица%2C%2014%2C%20деревня%20Чёрное%2C%20Московская%20область"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-blue-600 underline hover:text-blue-700"
            >
              Открыть в Яндекс.Картах →
            </a>
          </div>
        </div>
      </noscript>
    </div>
  );
}

export default YandexMapEmbedWithFallback;
