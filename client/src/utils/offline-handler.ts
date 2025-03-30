import { create } from 'zustand';
import { queryClient } from '../lib/query-client';

interface OfflineStore {
  isOnline: boolean;
  syncInProgress: boolean;
  pendingRequests: PendingRequest[];
  lastSyncTime?: number;
  setOnline: (status: boolean) => void;
  setSyncStatus: (inProgress: boolean) => void;
  addPendingRequest: (request: PendingRequest) => void;
  removePendingRequest: (url: string) => void;
}

interface PendingRequest {
  url: string;
  method: string;
  body?: any;
  retryCount: number;
  error?: string;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  isOnline: navigator.onLine,
  syncInProgress: false,
  pendingRequests: [],
  setOnline: (status) => set({ isOnline: status }),
  setSyncStatus: (inProgress) => set({ syncInProgress: inProgress }),
  addPendingRequest: (request) =>
    set((state) => ({
      pendingRequests: [...state.pendingRequests, request]
    })),
  removePendingRequest: (url) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter(req => req.url !== url)
    }))
}));

let syncPromise: Promise<void> | null = null;

async function syncPendingRequests() {
  const store = useOfflineStore.getState();
  if (store.syncInProgress || syncPromise) return;

  store.setSyncStatus(true);
  const requests = [...store.pendingRequests];
  
  syncPromise = (async () => {

  try {
    for (const request of requests) {
      if (request.retryCount >= 5) {
        console.warn(`Request to ${request.url} failed after 5 retries, removing from queue`);
        store.removePendingRequest(request.url);
        continue;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), request.retryCount > 0 ? 10000 : 5000);

        const response = await fetch(request.url, {
          method: request.method,
          body: request.body ? JSON.stringify(request.body) : undefined,
          headers: {
            'Content-Type': 'application/json',
            'X-Retry-Count': request.retryCount.toString(),
            'X-Request-ID': `${Date.now()}-${Math.random().toString(36).slice(2)}`
          },
          signal: controller.signal,
          credentials: 'same-origin'
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // Cache successful responses
        if (response.ok && response.status !== 204) {
          const responseClone = response.clone();
          const cache = await caches.open('api-cache');
          await cache.put(request.url, responseClone);
        }

        store.removePendingRequest(request.url);
        await queryClient.invalidateQueries();
      } catch (error) {
        console.error('Failed to sync request:', error);
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          request.retryCount++;
        }
        request.error = error instanceof Error ? error.message : 'Unknown error';
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    store.setSyncStatus(false);
    syncPromise = null;
    
    // Exponential backoff for retries
    const remainingRequests = useOfflineStore.getState().pendingRequests;
    if (remainingRequests.length > 0) {
      const backoffTime = Math.min(30000 * Math.pow(2, Math.floor(remainingRequests[0].retryCount / 3)), 300000);
      setTimeout(syncPendingRequests, backoffTime);
    }
  }
})();

return syncPromise;
}

export function initializeOfflineHandler() {
  const store = useOfflineStore.getState();
  
  // Check connection status immediately
  store.setOnline(navigator.onLine);

  // Monitor connection quality
  const connection = (navigator as any).connection;
  if (connection) {
    connection.addEventListener('change', () => {
      store.setOnline(navigator.onLine && connection.downlink > 0);
    });
  }

  window.addEventListener('online', () => {
    store.setOnline(true);
    queryClient.invalidateQueries();
    void syncPendingRequests();
  });

  window.addEventListener('offline', () => {
    store.setOnline(false);
  });
}