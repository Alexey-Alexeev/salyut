const CACHE_NAME = 'salutgrad-v1';
const STATIC_CACHE = 'salutgrad-static-v1';
const DYNAMIC_CACHE = 'salutgrad-dynamic-v1';

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
  '/api/version',
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Установка');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Кэширование статических ресурсов');
        return cache.addAll(STATIC_URLS);
      })
      .then(() => {
        console.log('Service Worker: Установка завершена');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Активация');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Удаление старого кэша:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Активация завершена');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Пропускаем API запросы и другие ресурсы
  if (NO_CACHE_URLS.some(noCacheUrl => url.pathname.startsWith(noCacheUrl))) {
    return;
  }
  
  // Пропускаем внешние ресурсы
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (FORCE_UPDATE_MODE) {
          // АГРЕССИВНЫЙ РЕЖИМ: всегда загружаем свежую версию
          console.log('Service Worker: Принудительное обновление - загружаем свежую версию:', request.url);
          return fetch(request)
            .then((response) => {
              // Обновляем кэш свежей версией
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
              return response;
            })
            .catch(() => {
              // Если нет сети, возвращаем кэшированную версию как fallback
              return cachedResponse || new Response('Offline', { status: 503 });
            });
        } else {
          // ОБЫЧНЫЙ РЕЖИМ: используем кэш
          if (cachedResponse) {
            console.log('Service Worker: Возвращаем из кэша:', request.url);
            return cachedResponse;
          }
          
          // Иначе загружаем из сети и кэшируем
          return fetch(request)
            .then((response) => {
              // Клонируем ответ для кэширования
            const responseClone = response.clone();
            
            // Кэшируем только успешные ответы
            if (response.status === 200) {
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  console.log('Service Worker: Кэшируем новый ресурс:', request.url);
                  cache.put(request, responseClone);
                });
            }
            
            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Ошибка загрузки:', error);
            throw error;
          });
        }
      })
  );
});

// Обработка сообщений от основного потока
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('Service Worker: Принудительное обновление');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('Service Worker: Очистка кэша');
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
                console.log('Service Worker: Удаляем старый кэш:', request.url);
                cache.delete(request);
              }
            }
          }
        });
      });
    });
  });
}, 60 * 60 * 1000); // Проверяем каждый час
