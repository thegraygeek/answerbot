
// Cache version control
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-cache-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-cache-${CACHE_VERSION}`;
const API_CACHE = `api-cache-${CACHE_VERSION}`;

// Resources to precache
const STATIC_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/favicon.png',
  '/icons/icon-192x192.png'
];

// Install event - precache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_RESOURCES))
      .then(() => self.skipWaiting())
  );
});

// Activate event - cleanup old caches
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
  );
});

// Network first strategy for API requests
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      await cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    throw new Error('Network response not ok');
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache first strategy for static assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    await cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

// Fetch event handler
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Handle API requests
  if (request.url.includes('/api/')) {
    event.respondWith(
      networkFirst(request)
        .catch(error => {
          console.error('API request failed:', error);
          return new Response(
            JSON.stringify({
              error: 'Service temporarily unavailable',
              status: 'error'
            }),
            {
              status: 503,
              headers: {
                'Content-Type': 'application/json'
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
      cacheFirst(request)
        .catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    cacheFirst(request)
      .catch(error => {
        console.error('Static asset fetch failed:', error);
        return new Response('Resource not available', { status: 404 });
      })
  );
});

// Error handling
self.addEventListener('error', event => {
  console.error('Service worker error:', event);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
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
  
  for (const request of requests) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    } catch (error) {
      console.error('Failed to sync request:', error);
    }
  }
}
