import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Welcome from "@/pages/welcome";
import { ThemeProvider } from "./hooks/use-theme";
import { useState, useEffect } from "react";

// Auth context interface
interface AuthStatus {
  isLoggedIn: boolean;
  userId?: number;
  firstName?: string;
  email?: string;
  isLoading: boolean;
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

function useAuth() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isLoggedIn: false,
    isLoading: true
  });
  
  const { data, isLoading } = useQuery({
    queryKey: ['/api/auth/status'],
    queryFn: () => apiRequest('/api/auth/status', { method: "GET" }),
  });
  
  useEffect(() => {
    if (!isLoading && data) {
      setAuthStatus({
        ...data,
        isLoading: false
      } as AuthStatus);
    }
  }, [data, isLoading]);
  
  return authStatus;
}

function Router() {
  const { isLoggedIn, isLoading } = useAuth();
  const [location] = useLocation();
  
  // If user is on home page and is logged in, redirect to chat
  useEffect(() => {
    if (!isLoading && isLoggedIn && location === "/") {
      window.location.href = "/chat";
    }
  }, [isLoggedIn, isLoading, location]);
  
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route path="/chat">
        <AuthenticatedRoute component={Home} path="/chat" />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
