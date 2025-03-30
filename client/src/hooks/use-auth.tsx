import { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface AuthStatus {
  isLoggedIn: boolean;
  userId?: number;
  firstName?: string;
  email?: string;
  isLoading: boolean;
  error?: string;
}

type AuthContextType = {
  authStatus: AuthStatus;
  setAuthStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  refreshAuth: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isLoggedIn: false,
    isLoading: true
  });

  // Check if user previously logged in (local storage backup)
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem('auth_status');
      if (savedAuth) {
        const parsedAuth = JSON.parse(savedAuth);
        setAuthStatus(prev => ({
          ...prev,
          ...parsedAuth,
          // Still keep loading true until we verify with server
          isLoading: true
        }));
      }
    } catch (error) {
      console.error('Error reading auth from localStorage:', error);
    }
  }, []);

  const { data, isLoading, refetch } = useQuery<AuthStatus>({
    queryKey: ['/api/auth/status'],
    queryFn: async () => {
      return apiRequest<AuthStatus>('/api/auth/status', { method: "GET" });
    },
    staleTime: 10000, // Refresh after 10 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    if (!isLoading && data) {
      // Update auth status from API response
      setAuthStatus({
        ...data,
        isLoading: false
      });

      // Save to localStorage for persistence
      if (data.isLoggedIn) {
        localStorage.setItem('auth_status', JSON.stringify({
          isLoggedIn: data.isLoggedIn,
          userId: data.userId,
          firstName: data.firstName,
          email: data.email
        }));
      } else {
        // Clear localStorage if not logged in
        localStorage.removeItem('auth_status');
      }
    } else if (!isLoading) {
      setAuthStatus(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  }, [data, isLoading]);

  // Function to allow manual refresh of auth status
  const refreshAuth = () => {
    setAuthStatus(prev => ({
      ...prev,
      isLoading: true
    }));
    refetch();
  };

  // Function to handle logout
  const logout = async () => {
    try {
      await apiRequest('/api/logout', { method: 'POST' });
      // Clear local storage
      localStorage.removeItem('auth_status');
      // Update state
      setAuthStatus({
        isLoggedIn: false,
        isLoading: false
      });
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      authStatus,
      setAuthStatus,
      refreshAuth,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}