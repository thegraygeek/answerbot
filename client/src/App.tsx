import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Welcome from "@/pages/welcome";
import { ThemeProvider } from "./hooks/use-theme";
import { useState, useEffect, createContext, useContext } from "react";
import { usePwa } from "./hooks/use-pwa";
import InstallPrompt from "./components/pwa/install-prompt";
import { Loader2 } from "lucide-react";

// Auth context interface
interface AuthStatus {
  isLoggedIn: boolean;
  userId?: number;
  firstName?: string;
  email?: string;
  isLoading: boolean;
}

interface AuthContextType extends AuthStatus {
  refreshAuth: () => void;
  logout: () => Promise<void>;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

// Auth Provider Component
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
      ...authStatus,
      refreshAuth,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
// Export the auth hook so it can be used in other components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function AuthenticatedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>, path: string }) {
  const { isLoggedIn, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      setLocation("/");
    }
  }, [isLoggedIn, isLoading, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return isLoggedIn ? <Component {...rest} /> : null;
}

function Router() {
  const { isLoggedIn, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  // If user is on home page and is logged in, redirect to chat
  useEffect(() => {
    if (!isLoading && isLoggedIn && location === "/") {
      setLocation("/chat");
    }
  }, [isLoggedIn, isLoading, location, setLocation]);
  
  // If user is on chat page and is not logged in, redirect to home
  useEffect(() => {
    if (!isLoading && !isLoggedIn && location === "/chat") {
      setLocation("/");
    }
  }, [isLoggedIn, isLoading, location, setLocation]);
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/" component={isLoggedIn ? () => <Redirect to="/chat" /> : Welcome} />
      <Route path="/chat" component={isLoggedIn ? Home : () => <Redirect to="/" />} />
      <Route component={NotFound} />
    </Switch>
  );
}

// PWA Install Prompt Component
function PwaInstallPrompt() {
  const { showInstallPrompt, installApp, hideInstallPrompt, isInstalled } = usePwa();
  const { isLoggedIn } = useAuth();
  
  // Only show install prompt if user is logged in
  if (isInstalled || !showInstallPrompt || !isLoggedIn) {
    return null;
  }
  
  return (
    <InstallPrompt 
      onInstall={installApp} 
      onDismiss={hideInstallPrompt}
    />
  );
}

function App() {
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

export default App;
