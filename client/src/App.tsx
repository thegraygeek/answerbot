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
import InstallPromptComponent from "./components/pwa/install-prompt";

// Auth context interface
interface AuthStatus {
  isLoggedIn: boolean;
  userId?: number;
  firstName?: string;
  email?: string;
  isLoading: boolean;
  refreshAuth?: () => void;
}

// Create auth context
const AuthContext = createContext<AuthStatus>({
  isLoggedIn: false,
  isLoading: true
});

// Auth context already created above

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isLoggedIn: false,
    isLoading: true
  });
  
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
      setAuthStatus({
        ...data,
        isLoading: false,
        refreshAuth: refetch
      });
    } else if (!isLoading) {
      setAuthStatus(prev => ({
        ...prev,
        isLoading: false,
        refreshAuth: refetch
      }));
    }
  }, [data, isLoading, refetch]);

  return (
    <AuthContext.Provider value={authStatus}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
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
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
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
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
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
  
  if (isInstalled || !showInstallPrompt) {
    return null;
  }
  
  return (
    <InstallPromptComponent 
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
