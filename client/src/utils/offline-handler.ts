import { create } from 'zustand';
import { queryClient } from '../lib/query';

interface OfflineStore {
  isOnline: boolean;
  syncInProgress: boolean;
  lastSyncTime?: number;
  pendingRequests: Array<{
    url: string;
    method: string;
    body?: any;
    timestamp: number;
    retryCount: number;
    error?: string;
  }>;
  setOnline: (status: boolean) => void;
  setSyncStatus: (inProgress: boolean) => void;
  addPendingRequest: (request: any) => void;
  removePendingRequest: (url: string) => void;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  isOnline: navigator.onLine,
  syncInProgress: false,
  pendingRequests: [],
  setOnline: (status) => set({ isOnline: status }),
  setSyncStatus: (inProgress) => set({ syncInProgress: inProgress }),
  addPendingRequest: (request) => 
    set((state) => ({ 
      pendingRequests: [...state.pendingRequests, { 
        ...request, 
        timestamp: Date.now(),
        retryCount: 0 
      }] 
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
        console.warn(`Request to ${request.url} failed after 3 retries`);
        store.removePendingRequest(request.url);
        continue;
      }

      try {
        const response = await fetch(request.url, {
          method: request.method,
          body: request.body ? JSON.stringify(request.body) : undefined,
          headers: { 
            'Content-Type': 'application/json',
            'X-Retry-Count': request.retryCount.toString()
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        store.removePendingRequest(request.url);
        queryClient.invalidateQueries();
      } catch (error) {
        console.error('Failed to sync request:', error);
        request.retryCount++;
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
    syncPendingRequests();
  });

  window.addEventListener('offline', () => {
    store.setOnline(false);
  });
}