const CACHE_NAME = 'ttw-cache-v12';
const RUNTIME_CACHE = 'ttw-runtime-v12';

const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/ttww-logo-dark.png',
  '/ttww-logo-light.png',
  '/welcome'
];

// Cache expiration duration (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_RESOURCES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys => Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      )),
      cleanExpiredCache(),
      clients.claim()
    ])
  );
});

function cleanExpiredCache() {
  const now = Date.now();
  return caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => {
        return caches.open(cacheName).then(cache => {
          return cache.keys().then(requests => {
            return Promise.all(
              requests.map(request => {
                return cache.match(request).then(response => {
                  if (response && response.headers.get('date')) {
                    const date = new Date(response.headers.get('date')).getTime();
                    if (now - date > CACHE_EXPIRATION) {
                      return cache.delete(request);
                    }
                  }
                });
              })
            );
          });
        });
      })
    );
  });
}

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    return event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html') ||
            new Response(JSON.stringify({ error: 'You are offline', status: 'error' }), {
              status: 503,
              headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
              }
            });
        })
    );
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    return event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html'))
    );
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            if (event.request.destination === 'image') {
              return new Response();
            }
            return caches.match('/offline.html');
          });
      })
  );
});