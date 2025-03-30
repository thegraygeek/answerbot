import { createContext, useContext, useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { PwaInstallPrompt } from './components/pwa/install-prompt';
import { useLocation, useNavigate } from './hooks/use-location';
import { queryClient } from './lib/query-client';
import { Switch, Route, Redirect } from "wouter";
import { apiRequest } from "./lib/queryClient";
import Home from "@/pages/home";
import Welcome from "@/pages/welcome";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";


interface AuthStatus {
  isLoggedIn: boolean;
  userId?: number;
  firstName?: string;
  email?: string;
  isLoading: boolean;
}

type AuthContextType = {
  authStatus: AuthStatus;
  setAuthStatus: React.Dispatch<React.SetStateAction<AuthStatus>>;
  refreshAuth: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

function AuthProvider({ children }: { children: React.ReactNode }) {
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

function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!authStatus.isLoading && !authStatus.isLoggedIn) {
      navigate('/welcome');
    }
  }, [authStatus.isLoading, authStatus.isLoggedIn, navigate]);

  if (authStatus.isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return authStatus.isLoggedIn ? <>{children}</> : null;
}


function Router() {
  const { authStatus } = useAuth();
  const [location, setLocation] = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authStatus.isLoading && authStatus.isLoggedIn && location === "/") {
      setLocation("/chat");
    }
  }, [authStatus.isLoggedIn, authStatus.isLoading, location, setLocation]);

  useEffect(() => {
    if (!authStatus.isLoading && !authStatus.isLoggedIn && location === "/chat") {
      setLocation("/");
    }
  }, [authStatus.isLoggedIn, authStatus.isLoading, location, setLocation]);

  if (authStatus.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={authStatus.isLoggedIn ? () => <Redirect to="/chat" /> : Welcome} />
      <Route path="/chat" component={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <PwaInstallPrompt />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}