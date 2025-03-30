import { useState, useEffect, createContext, useContext } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { Route, Switch } from "wouter";
import WelcomePage from "./pages/welcome-page";
import ChatPage from "./pages/chat-page";
import NotFound from "./pages/not-found";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "./components/ui/toaster";

// Create a QueryClient instance
const queryClient = new QueryClient();

// Create a context for navigation
interface NavigationContextType {
  currentPage: string;
  navigateTo: (page: string) => void;
}

export const NavigationContext = createContext<NavigationContextType>({
  currentPage: "welcome",
  navigateTo: () => {},
});

function App() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState("welcome");
  
  // Provide context values
  const navigationValue = { 
    currentPage, 
    navigateTo: (page: string) => setCurrentPage(page)
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="ttw-theme">
        <NavigationContext.Provider value={navigationValue}>
          <main className="min-h-screen bg-background">
            <Switch>
              <Route path="/" component={WelcomePage} />
              <Route path="/chat" component={ChatPage} />
              <Route component={NotFound} />
            </Switch>
          </main>
          <Toaster />
        </NavigationContext.Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;