import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Local storage keys
const INSTALL_PROMPT_DISMISSED_KEY = 'install-prompt-dismissed';

export function usePwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if the user has already dismissed the prompt
    const hasUserDismissed = localStorage.getItem(INSTALL_PROMPT_DISMISSED_KEY) === 'true';
    
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show the prompt if the user hasn't explicitly dismissed it
      if (!hasUserDismissed) {
        // Show prompt after a reasonable delay (60 seconds)
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 60 * 1000);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      // Clear storage item
      localStorage.removeItem(INSTALL_PROMPT_DISMISSED_KEY);
      
      // Clear the deferredPrompt
      setDeferredPrompt(null);
      // Hide install prompt
      setShowInstallPrompt(false);
      // Update installed state
      setIsInstalled(true);
      // Log the installation
      console.log('App was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Function to trigger the install prompt
  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('Install prompt not available');
      
      // Try alternative methods for iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert('To install this app on iOS: tap the share button, then "Add to Home Screen"');
      }
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
      // Mark as dismissed
      localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, 'true');
    }
    
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Function to hide the install prompt
  const hideInstallPrompt = () => {
    setShowInstallPrompt(false);
    // Mark as dismissed permanently
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_KEY, 'true');
  };

  return {
    isInstalled,
    showInstallPrompt,
    installApp,
    hideInstallPrompt
  };
}
