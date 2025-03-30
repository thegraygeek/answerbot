
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

async function syncPendingRequests() {
  const store = useOfflineStore.getState();
  if (store.syncInProgress) return;

  store.setSyncStatus(true);
  const requests = [...store.pendingRequests];

  try {
    for (const request of requests) {
      if (request.retryCount >= 3) {
        store.removePendingRequest(request.url);
        continue;
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(request.url, {
          method: request.method,
          body: request.body ? JSON.stringify(request.body) : undefined,
          headers: { 
            'Content-Type': 'application/json',
            'X-Retry-Count': request.retryCount.toString()
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
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
  } finally {
    store.setSyncStatus(false);
    store.lastSyncTime = Date.now();
  }
}

export function initializeOfflineHandler() {
  const store = useOfflineStore.getState();

  window.addEventListener('online', () => {
    store.setOnline(true);
    queryClient.invalidateQueries();
    void syncPendingRequests();
  });

  window.addEventListener('offline', () => {
    store.setOnline(false);
  });
}
