
const CACHE_NAME = 'ttw-cache-v6';
const RUNTIME_CACHE = 'ttw-runtime-v6';
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

self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Special handling for API requests
  if (event.request.url.includes('/api/')) {
    return event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html') ||
            new Response('Network error occurred', { status: 503 });
        })
    );
  }

  // Network first strategy for welcome page
  if (event.request.url.includes('/welcome')) {
    return event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
  }

  // Cache first strategy for static resources
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
            return caches.match('/offline.html') ||
              new Response('Network error occurred', { status: 503 });
          });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
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
