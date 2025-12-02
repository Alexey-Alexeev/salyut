'use client';

import { useEffect, useRef } from 'react';
import { DELIVERY_CONSTANTS } from '@/lib/delivery-utils';

declare global {
  interface Window {
    ymaps: any;
  }
}

export interface YandexMapProps {
  className?: string;
  height?: string;
  showControls?: boolean;
  zoom?: number;
}

export function YandexMap({
  className = '',
  height = '400px',
  showControls = true,
  zoom = 15,
}: YandexMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    const initMap = () => {
      if (!window.ymaps || !mapRef.current) {
        return;
      }

      window.ymaps.ready(() => {
        const map = new window.ymaps.Map(mapRef.current, {
          center: [
            DELIVERY_CONSTANTS.PICKUP_ADDRESS.coordinates.lat,
            DELIVERY_CONSTANTS.PICKUP_ADDRESS.coordinates.lng,
          ],
          zoom: zoom,
          controls: showControls
            ? [
              'zoomControl',
              'searchControl',
              'typeSelector',
              'fullscreenControl',
              'routeButtonControl',
            ]
            : [],
        });

        const placemark = new window.ymaps.Placemark(
          [
            DELIVERY_CONSTANTS.PICKUP_ADDRESS.coordinates.lat,
            DELIVERY_CONSTANTS.PICKUP_ADDRESS.coordinates.lng,
          ],
          {
            balloonContentHeader: 'СалютГрад.рф - Склад фейерверков',
            balloonContentBody: `
                            <div style="font-size: 14px; line-height: 1.4;">
                                <p><strong>Адрес:</strong><br/>${DELIVERY_CONSTANTS.PICKUP_ADDRESS.fullAddress}</p>
                                <p><strong>Телефон:</strong><br/>+7 (977) 360-20-08</p>
                                <hr style="margin: 10px 0;"/>
                                <p style="color: #666; font-size: 12px;">💡 Предварительно позвоните для уточнения готовности заказа</p>
                            </div>
                        `,
            balloonContentFooter: '<small>СалютГрад.рф © 2025</small>',
            hintContent: 'Склад СалютГрад.рф - Самовывоз фейерверков',
          },
          {
            preset: 'islands#redDotIcon',
            iconColor: '#ff6b35',
          }
        );

        map.geoObjects.add(placemark);
        mapInstanceRef.current = map;

        setTimeout(() => {
          placemark.balloon.open();
        }, 1000);
      });
    };

    if (window.ymaps) {
      initMap();
    } else {
      const apiKey = process.env.NEXT_PUBLIC_YANDEX_API_KEY || '';
      const script = document.createElement('script');
      script.src =
        `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [zoom, showControls]);

  return (
    <div className={className}>
      <div
        ref={mapRef}
        style={{ width: '100%', height }}
        className="overflow-hidden rounded-lg border border-gray-200"
      />
      <div className="text-muted-foreground mt-2 text-center text-xs">
        📍 {DELIVERY_CONSTANTS.PICKUP_ADDRESS.fullAddress}
      </div>
    </div>
  );
}

export function YandexMapWithFallback(props: YandexMapProps) {
  return (
    <div className={props.className}>
      <YandexMap {...props} />
      <noscript>
        <div
          className="flex w-full items-center justify-center rounded-lg border border-gray-200 bg-slate-100"
          style={{ height: props.height || '400px' }}
        >
          <div className="space-y-2 p-6 text-center">
            <div className="text-4xl text-slate-400">🗺️</div>
            <p className="font-medium text-slate-600">Карта недоступна</p>
            <p className="text-sm text-slate-500">
              {DELIVERY_CONSTANTS.PICKUP_ADDRESS.fullAddress}
            </p>
            <a
              href={`https://yandex.ru/maps/?text=${encodeURIComponent(DELIVERY_CONSTANTS.PICKUP_ADDRESS.fullAddress)}`}
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

export default YandexMapWithFallback;
