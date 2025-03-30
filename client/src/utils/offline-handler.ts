
import { create } from 'zustand';

interface OfflineStore {
  isOnline: boolean;
  pendingRequests: Array<{
    url: string;
    method: string;
    body?: any;
    timestamp: number;
  }>;
  setOnline: (status: boolean) => void;
  addPendingRequest: (request: any) => void;
  removePendingRequest: (url: string) => void;
}

export const useOfflineStore = create<OfflineStore>((set) => ({
  isOnline: navigator.onLine,
  pendingRequests: [],
  setOnline: (status) => set({ isOnline: status }),
  addPendingRequest: (request) => 
    set((state) => ({ 
      pendingRequests: [...state.pendingRequests, { ...request, timestamp: Date.now() }] 
    })),
  removePendingRequest: (url) =>
    set((state) => ({
      pendingRequests: state.pendingRequests.filter(req => req.url !== url)
    }))
}));

export function initializeOfflineHandler() {
  const store = useOfflineStore.getState();

  window.addEventListener('online', () => {
    store.setOnline(true);
    syncPendingRequests();
  });

  window.addEventListener('offline', () => {
    store.setOnline(false);
  });
}

async function syncPendingRequests() {
  const store = useOfflineStore.getState();
  const requests = [...store.pendingRequests];

  for (const request of requests) {
    try {
      await fetch(request.url, {
        method: request.method,
        body: request.body ? JSON.stringify(request.body) : undefined,
        headers: { 'Content-Type': 'application/json' }
      });
      store.removePendingRequest(request.url);
    } catch (error) {
      console.error('Failed to sync request:', error);
    }
  }
}
