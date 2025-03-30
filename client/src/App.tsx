import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { ThemeProvider } from "./hooks/use-theme";
import { VoiceProvider } from "./hooks/use-voice-context";
import { usePwa } from "./hooks/use-pwa";
import InstallPromptComponent from "./components/pwa/install-prompt";
import { VoiceToggle } from "./components/voice/voice-toggle";

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

// Voice Controls Component
function VoiceControls() {
  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2">
      <VoiceToggle />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <VoiceProvider>
          <Switch>
            <Route path="/" component={Home} />
            <Route component={NotFound} />
          </Switch>
          <PwaInstallPrompt />
          <VoiceControls />
          <Toaster />
        </VoiceProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
