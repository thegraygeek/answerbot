// Service Worker for TTwW Answerbot PWA

const CACHE_NAME = 'ttww-answerbot-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/ttww-logo-dark.png',
  '/ttww-logo-light.png'
];

// Install event - cache app shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache if available, fetch from network otherwise
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            // Return the original response if fetching from API
            if (event.request.url.includes('/api/')) {
              return response;
            }
            
            // Don't cache non-GET requests
            if (event.request.method !== 'GET') {
              return response;
            }
            
            // Clone the response as it can only be used once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});