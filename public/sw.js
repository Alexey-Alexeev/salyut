const CACHE_NAME = 'salutgrad-v2'; // Обновлена версия
const STATIC_CACHE = 'salutgrad-static-v2';
const DYNAMIC_CACHE = 'salutgrad-dynamic-v2';
const PROMO_CACHE = 'salutgrad-promo-v2'; // Отдельный кэш для рекламных страниц

// Настройка агрессивного обновления
const FORCE_UPDATE_MODE = true; // true = принудительное обновление, false = обычное кэширование

// Статические ресурсы для кэширования
const STATIC_URLS = [
  '/',
  '/catalog/',
  '/catalog/promo/fireworks/', // Промо страница для рекламы
  '/about/',
  '/delivery/',
  '/privacy/',
  '/terms/',
  '/services/launching/',
  '/manifest.json',
];

// Промо страницы, которые должны кэшироваться агрессивно и мгновенно загружаться
const PROMO_URLS = [
  '/catalog/promo/fireworks/',
];

// Ресурсы, которые не должны кэшироваться
const NO_CACHE_URLS = [
  '/version.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Кэшируем статические ресурсы
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_URLS);
      }),
      // Предварительно кэшируем промо страницы для мгновенной загрузки
      caches.open(PROMO_CACHE).then((cache) => {
        // Кэшируем промо страницы с приоритетом
        return Promise.all(
          PROMO_URLS.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response);
              }
            }).catch(() => {
              // Игнорируем ошибки при предварительном кэшировании
            })
          )
        );
      })
    ]).then(() => {
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
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== PROMO_CACHE) {
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
  
  // Пропускаем API запросы и другие ресурсы
  if (NO_CACHE_URLS.some(noCacheUrl => url.pathname.startsWith(noCacheUrl))) {
    return;
  }
  
  // Пропускаем внешние ресурсы
  if (url.origin !== location.origin) {
    return;
  }
  
  // Проверяем, является ли это промо страницей
  const isPromoUrl = PROMO_URLS.some(promoUrl => 
    url.pathname === promoUrl || url.pathname === promoUrl.replace(/\/$/, '')
  );
  
  // Редирект старой рекламной ссылки на новую промо страницу (fallback для клиентского редиректа)
  const isOldAdUrl = (url.pathname === '/catalog/' || url.pathname === '/catalog') &&
    url.searchParams.getAll('category').includes('Fireworks') &&
    url.searchParams.getAll('category').includes('Fan-salutes') &&
    url.searchParams.get('sortBy') === 'price-asc';
  
  if (isOldAdUrl) {
    // Перенаправляем на статическую промо страницу
    // Используем 307 (temporary redirect) вместо 301, так как это клиентский редирект
    // Настоящий 301 должен быть настроен на сервере через .htaccess
    event.respondWith(
      Response.redirect(new URL('/catalog/promo/fireworks/', location.origin), 307)
    );
    return;
  }
  
  // Создаем ключ для кеша (нормализуем URL)
  const cacheKey = request.url;
  
  event.respondWith(
    caches.match(cacheKey)
      .then((cachedResponse) => {
        // Для промо страниц - МАКСИМАЛЬНЫЙ приоритет кешу для мгновенной загрузки
        if (isPromoUrl) {
          if (cachedResponse) {
            // Возвращаем кеш МГНОВЕННО и обновляем в фоне
            fetch(request)
              .then((response) => {
                if (response && response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(PROMO_CACHE).then((cache) => {
                    cache.put(cacheKey, responseToCache);
                  });
                }
              })
              .catch(() => {});
            return cachedResponse;
          } else {
            // Если кеша нет, загружаем и агрессивно кешируем
            return fetch(request)
              .then((response) => {
                if (response && response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(PROMO_CACHE).then((cache) => {
                    cache.put(cacheKey, responseToCache);
                  });
                }
                return response;
              });
          }
        }
        
        if (FORCE_UPDATE_MODE) {
          // АГРЕССИВНЫЙ РЕЖИМ: всегда загружаем свежую версию
          return fetch(request)
            .then((response) => {
              // Обновляем кэш свежей версией
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                  cache.put(cacheKey, responseToCache);
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
                  cache.put(cacheKey, responseClone);
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
  // Очистка динамического кэша
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
  
  // Промо кэш хранится дольше - 7 дней
  caches.open(PROMO_CACHE).then((cache) => {
    cache.keys().then((requests) => {
      requests.forEach((request) => {
        cache.match(request).then((response) => {
          if (response) {
            const dateHeader = response.headers.get('date');
            if (dateHeader) {
              const responseDate = new Date(dateHeader);
              const now = new Date();
              const ageInDays = (now - responseDate) / (1000 * 60 * 60 * 24);
              
              // Удаляем кэш старше 7 дней
              if (ageInDays > 7) {
                cache.delete(request);
              }
            }
          }
        });
      });
    });
  });
}, 60 * 60 * 1000); // Проверяем каждый час
