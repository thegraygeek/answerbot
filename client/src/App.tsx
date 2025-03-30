import { useState, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { PwaInstallPrompt } from './components/pwa/install-prompt';
import { useLocation, LocationProvider } from '@/hooks/use-location';
import { queryClient } from "@/lib/queryClient";
import { Switch, Route } from "wouter";
import Home from "@/pages/home";
import Welcome from "@/pages/welcome";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";
import { useAuth, AuthProvider } from '@/hooks/use-auth';

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

  useEffect(() => {
    if (!authStatus.isLoading) {
      if (authStatus.isLoggedIn && (location === "/" || location === "/welcome")) {
        setLocation("/chat");
      } else if (!authStatus.isLoggedIn && location === "/chat") {
        setLocation("/");
      }
    }
  }, [authStatus.isLoggedIn, authStatus.isLoading, location, setLocation]);

  if (authStatus.isLoading || authStatus.error) {
    return (
      <div className="flex h-screen w-full items-center justify-center flex-col gap-2">
        {authStatus.isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : (
          <>
            <div className="text-destructive">Failed to load auth status</div>
            <button onClick={() => window.location.reload()} className="text-primary hover:underline">
              Retry
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/">
        <Welcome />
      </Route>
      <Route path="/chat">
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocationProvider>
          <AuthProvider>
            <Router />
            <PwaInstallPrompt />
            <Toaster />
          </AuthProvider>
        </LocationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}