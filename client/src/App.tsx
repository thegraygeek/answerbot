import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { ThemeProvider } from "./hooks/use-theme";
import { usePwa } from "./hooks/use-pwa";
import InstallPromptComponent from "./components/pwa/install-prompt";

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
        <Switch>
          <Route path="/" component={Home} />
          <Route component={NotFound} />
        </Switch>
        <PwaInstallPrompt />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
