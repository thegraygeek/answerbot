// Cache names
const CACHE_NAME = 'ttw-cache-v1';
const RUNTIME_CACHE = 'runtime-cache';
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_RESOURCES))
      .then(() => self.skipWaiting())
      .catch(error => console.error('Cache installation failed:', error))
  );
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                return caches.delete(cacheName);
              }
            })
          );
        }),
      clients.claim()
    ])
  );
});

// Fetch event
self.addEventListener('fetch', event => {
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        })
        .catch(error => {
          console.error('API request failed:', error);
          return new Response(
            JSON.stringify({
              error: navigator.onLine ? 'Service unavailable' : 'You are offline',
              status: 'error'
            }),
            {
              status: navigator.onLine ? 500 : 503,
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
              }
            }
          );
        })
    );
    return;
  }

  // HTML navigation
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Other static resources
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE)
          .then(cache => {
            return fetch(event.request)
              .then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                  return response;
                }

                cache.put(event.request, response.clone());
                return response;
              });
          });
      })
  );
});

// Handle errors
self.addEventListener('error', event => {
  console.error('Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});