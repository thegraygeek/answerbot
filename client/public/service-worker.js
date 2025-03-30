// Cache version control
const CACHE_VERSION = '2';
const STATIC_CACHE = `static-cache-v${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-v${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;

const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-192x192.png'
];

// Network first strategy with timeout
async function networkFirstWithTimeout(request, cacheName, timeout = 3000) {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), timeout);
    });
    const networkPromise = fetch(request);
    const response = await Promise.race([networkPromise, timeoutPromise]);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      return response;
    }
    throw new Error('Network response was not ok');
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      return response;
    }
    throw new Error('Network response was not ok');
  } catch (error) {
    console.error('Cache first fetch failed:', error);
    throw error;
  }
}

// Install event handler
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_RESOURCES))
      .then(() => self.skipWaiting())
      .catch(error => console.error('Cache installation failed:', error))
  );
});

// Activate event handler
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('static-cache-') || 
                          name.startsWith('dynamic-cache-') || 
                          name.startsWith('api-cache-'))
            .filter(name => name !== STATIC_CACHE && 
                          name !== DYNAMIC_CACHE && 
                          name !== API_CACHE)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
      .catch(error => console.error('Cache cleanup failed:', error))
  );
});

// Fetch event handler
self.addEventListener('fetch', event => {
  const request = event.request;

  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      networkFirstWithTimeout(request, API_CACHE)
        .catch(error => {
          console.error('API request failed:', error);
          return new Response(
            JSON.stringify({
              error: navigator.onLine ? 'Service temporarily unavailable' : 'You are offline',
              status: 'error'
            }),
            {
              status: navigator.onLine ? 503 : 504,
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
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstWithTimeout(request, STATIC_CACHE)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    cacheFirst(request, STATIC_CACHE)
      .catch(error => {
        console.error('Static asset fetch failed:', error);
        return new Response('Resource not available', { 
          status: 404,
          headers: { 'Content-Type': 'text/plain' }
        });
      })
  );
});

// Background sync for offline operations
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(
      syncPendingRequests()
        .catch(error => console.error('Background sync failed:', error))
    );
  }
});

async function syncPendingRequests() {
  const cache = await caches.open(API_CACHE);
  const requests = await cache.keys();
  const failedRequests = [];

  for (const request of requests) {
    try {
      const response = await fetch(request.clone());
      if (response.ok) {
        await cache.delete(request);
      } else {
        failedRequests.push({
          url: request.url,
          status: response.status
        });
      }
    } catch (error) {
      console.error('Failed to sync request:', error);
      failedRequests.push({
        url: request.url,
        error: error.message
      });
    }
  }

  if (failedRequests.length > 0) {
    console.warn('Failed requests during sync:', failedRequests);
  }

  return failedRequests;
}

// Error handling
self.addEventListener('error', event => {
  console.error('Service worker error:', event);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});