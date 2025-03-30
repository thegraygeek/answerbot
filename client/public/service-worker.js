
const CACHE_NAME = 'ttw-cache-v11';
const RUNTIME_CACHE = 'ttw-runtime-v11';

// Handle offline mode and network errors
self.addEventListener('fetch', event => {
  if (!navigator.onLine) {
    event.respondWith(
      caches.match('/offline.html')
    );
  }
});

// Improve cache management
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
      clients.claim()
    ])
  );
});

// Cache expiration duration (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_RESOURCES);
      })
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

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

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

  if (event.request.mode === 'navigate') {
    return event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html'))
    );
  }

  if (event.request.url.includes('/welcome')) {
    return event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }

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
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            return caches.match('/offline.html');
          });
      })
  );
});
