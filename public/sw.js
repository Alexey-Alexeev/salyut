const CACHE_NAME = 'salutgrad-v2';
const STATIC_CACHE = 'salutgrad-static-v2';
const DYNAMIC_CACHE = 'salutgrad-dynamic-v2';

// Настройка агрессивного обновления
const FORCE_UPDATE_MODE = true; // true = принудительное обновление, false = обычное кэширование

// Статические ресурсы для кэширования
const STATIC_URLS = [
  '/',
  '/catalog/',
  '/about/',
  '/delivery/',
  '/privacy/',
  '/terms/',
  '/services/launching/',
  '/manifest.json',
];

// Ресурсы, которые не должны кэшироваться
const NO_CACHE_URLS = [
  '/version.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Обрабатываем только GET-запросы нашего домена
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // Никогда не перехватываем чанки Next.js и критичные ассеты JS/CSS
  const isNextAsset = url.pathname.startsWith('/_next/');
  const isScriptOrStyle = request.destination === 'script' || request.destination === 'style';
  if (isNextAsset || isScriptOrStyle) {
    return; // пусть браузер загрузит напрямую
  }

  // Пропускаем явно исключённые URL
  if (NO_CACHE_URLS.some((noCacheUrl) => url.pathname.startsWith(noCacheUrl))) {
    return;
  }

  // Навигации и HTML — стратегия network-first с fallback из кэша
  const isNavigation = request.mode === 'navigate' || request.destination === 'document';
  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Остальные типы (изображения, JSON) — stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || networkFetch;
    })
  );
});

// Обработка сообщений от основного потока
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Периодическая очистка старого кэша
setInterval(() => {
  caches.open(DYNAMIC_CACHE).then((cache) => {
    cache.keys().then((requests) => {
      requests.forEach((request) => {
        cache.match(request).then((response) => {
          if (response) {
            const dateHeader = response.headers.get('date');
            if (dateHeader) {
              const responseDate = new Date(dateHeader);
              const now = new Date();
              const ageInHours = (now - responseDate) / (1000 * 60 * 60);
              
              // Удаляем кэш старше 24 часов
              if (ageInHours > 24) {
                cache.delete(request);
              }
            }
          }
        });
      });
    });
  });
}, 60 * 60 * 1000); // Проверяем каждый час
