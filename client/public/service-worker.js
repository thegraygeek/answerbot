
const CACHE_NAME = 'ttw-cache-v13';
const RUNTIME_CACHE = 'ttw-runtime-v13';

// Essential static resources that need to be cached
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Cache expiration duration (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Install event handler
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event handler
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                console.log('Deleting old cache:', cacheName);
                return caches.delete(cacheName);
              }
            })
          );
        }),
      // Clean expired items from runtime cache
      cleanExpiredCache(),
      // Take control of all clients
      clients.claim()
    ])
  );
});

// Fetch event handler
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
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
            }), {
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

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response.ok) {
            throw new Error('Navigation request failed');
          }
          return caches.open(RUNTIME_CACHE)
            .then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
        })
        .catch(() => {
          return caches.match(event.request)
            .then(response => response || caches.match('/offline.html'));
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then(response => {
            // Cache successful responses
            if (response.ok && response.type === 'basic') {
              const responseToCache = response.clone();
              caches.open(RUNTIME_CACHE)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // Return empty response for images, offline page for other resources
            if (event.request.destination === 'image') {
              return new Response();
            }
            return caches.match('/offline.html');
          });
      })
  );
});

// Clean expired cache items
async function cleanExpiredCache() {
  const now = Date.now();
  const cache = await caches.open(RUNTIME_CACHE);
  const requests = await cache.keys();
  
  return Promise.all(
    requests.map(async request => {
      const response = await cache.match(request);
      if (response) {
        const dateHeader = response.headers.get('date');
        if (dateHeader) {
          const date = new Date(dateHeader).getTime();
          if (now - date > CACHE_EXPIRATION) {
            return cache.delete(request);
          }
        }
      }
    })
  );
}

// Handle errors
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});
