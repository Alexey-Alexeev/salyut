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

/**
 * Проверяет, является ли запрос запросом от вебвизора Яндекс.Метрики
 * Вебвизор должен всегда получать актуальный контент без кэширования
 * @param {URL} url - URL запроса для проверки
 * @returns {boolean} - true, если запрос от вебвизора
 */
function isWebvisorRequest(url) {
  // Проверка 1: Прямые запросы к домену вебвизора
  if (url.hostname.includes('webvisor.com')) {
    return true;
  }

  // Проверка 2: Запросы с параметрами отладки Метрики
  const debugParams = ['_ym_debug', 'webvisor', '_ym_is_debug', '_ym_recording'];
  if (debugParams.some(param => url.searchParams.has(param))) {
    return true;
  }

  // Проверка 3: Проверка URL на наличие признаков вебвизора в query или hash
  const searchLower = url.search.toLowerCase();
  const hashLower = url.hash.toLowerCase();
  if (searchLower.includes('webvisor') || hashLower.includes('webvisor')) {
    return true;
  }

  return false;
}

/**
 * Асинхронная проверка, находится ли клиент внутри iframe вебвизора
 * Используется как дополнительная проверка для запросов внутри iframe
 * @returns {Promise<boolean>} - true, если клиент находится в iframe вебвизора
 */
async function isWebvisorIframe() {
  try {
    const clients = await self.clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    });
    
    // Проверяем клиентов на наличие признаков вебвизора
    for (const client of clients) {
      // Если клиент в iframe (nested), проверяем его URL на признаки вебвизора
      if (client.frameType === 'nested') {
        try {
          const clientUrl = new URL(client.url);
          // Используем функцию isWebvisorRequest для единообразной проверки
          if (isWebvisorRequest(clientUrl)) {
            return true;
          }
        } catch (e) {
          // Если не удалось создать URL из client.url, пропускаем
          continue;
        }
      }
    }
    
    return false;
  } catch (e) {
    // Если не удалось проверить, возвращаем false для безопасности
    // Лучше пропустить проверку, чем заблокировать обычные запросы
    return false;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем все запросы к Яндекс.Метрике - не обрабатываем их через SW
  if (url.hostname.includes('mc.yandex.ru') || url.hostname.includes('metrika.yandex') || url.hostname.includes('webvisor.com')) {
    return;
  }

  // Обрабатываем только GET-запросы нашего домена
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return;
  }

  // Пропускаем запросы от вебвизора - вебвизор должен получать только актуальный контент
  if (isWebvisorRequest(url)) {
    return; // Не обрабатываем через SW, пусть браузер загрузит напрямую
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
    // Для вебвизора используем только network, без кэширования
    event.respondWith(
      (async () => {
        // Дополнительная проверка на iframe вебвизора
        const isWebvisor = await isWebvisorIframe();
        
        if (isWebvisor) {
          // Для вебвизора - только network, без кэширования и без fallback
          return fetch(request).catch(() => {
            // Если сеть недоступна, возвращаем ошибку вместо кэша
            return new Response('Network error', { status: 503 });
          });
        }

        // Для обычных запросов - network-first с fallback
        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        } catch (error) {
          const cached = await caches.match(request);
          return cached || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Остальные типы (изображения, JSON) — stale-while-revalidate
  // Для вебвизора - только network без кэширования
  event.respondWith(
    (async () => {
      // Проверяем, не является ли это запросом от вебвизора
      const isWebvisor = await isWebvisorIframe();
      
      if (isWebvisor) {
        // Для вебвизора - только network, без кэширования
        return fetch(request).catch(() => {
          return new Response('Network error', { status: 503 });
        });
      }

      // Для обычных запросов - stale-while-revalidate
      const cachedResponse = await caches.match(request);
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
    })()
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
