import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Local storage keys
const INSTALL_PROMPT_SHOWN_KEY = 'install-prompt-shown';
const INSTALL_PROMPT_DISMISSED_COUNT_KEY = 'install-prompt-dismissed-count';
const INSTALL_PROMPT_LAST_SHOWN_KEY = 'install-prompt-last-shown';

export function usePwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [forceShow, setForceShow] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Determine if we should show the prompt based on user history
    const shouldShowPrompt = () => {
      // If user is already in standalone mode, don't show prompt
      if (window.matchMedia('(display-mode: standalone)').matches) {
        return false;
      }
      
      // If the prompt has been dismissed less than 3 times, show after 30 seconds
      // If dismissed 3-5 times, show after 5 minutes
      // If dismissed more than 5 times, show after 1 day
      const dismissCount = parseInt(localStorage.getItem(INSTALL_PROMPT_DISMISSED_COUNT_KEY) || '0', 10);
      const lastShown = parseInt(localStorage.getItem(INSTALL_PROMPT_LAST_SHOWN_KEY) || '0', 10);
      const now = Date.now();
      
      let timeThreshold = 30 * 1000; // 30 seconds by default
      
      if (dismissCount >= 3 && dismissCount < 5) {
        timeThreshold = 5 * 60 * 1000; // 5 minutes
      } else if (dismissCount >= 5) {
        timeThreshold = 24 * 60 * 60 * 1000; // 1 day
      }
      
      return (now - lastShown) > timeThreshold;
    };

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt immediately if the user interacts with the app
      // or based on the time threshold logic
      if (forceShow || shouldShowPrompt()) {
        setShowInstallPrompt(true);
        localStorage.setItem(INSTALL_PROMPT_LAST_SHOWN_KEY, Date.now().toString());
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      // Clear all PWA-related local storage items
      localStorage.removeItem(INSTALL_PROMPT_SHOWN_KEY);
      localStorage.removeItem(INSTALL_PROMPT_DISMISSED_COUNT_KEY);
      localStorage.removeItem(INSTALL_PROMPT_LAST_SHOWN_KEY);
      
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

    // Check if we should show the prompt or force show
    const checkAndShowPrompt = () => {
      if (deferredPrompt && (forceShow || shouldShowPrompt())) {
        setShowInstallPrompt(true);
        localStorage.setItem(INSTALL_PROMPT_LAST_SHOWN_KEY, Date.now().toString());
      }
    };

    // Show prompt after user has interacted with the page for a while
    const setupTimeThresholds = () => {
      let timeouts: NodeJS.Timeout[] = [];
      
      // First prompt: Show after 45 seconds of page interaction
      timeouts.push(setTimeout(() => {
        checkAndShowPrompt();
      }, 45 * 1000));

      // Second prompt: If still not installed, try again after 3 minutes
      timeouts.push(setTimeout(() => {
        checkAndShowPrompt();
      }, 3 * 60 * 1000));

      return () => timeouts.forEach(clearTimeout);
    };

    // Check if we can show the prompt immediately
    checkAndShowPrompt();
    setupTimeThresholds();

    // User interaction triggers (click, scroll)
    const userInteraction = () => {
      setForceShow(true);
      checkAndShowPrompt();
    };

    // Wait for some user interaction before showing the prompt
    window.addEventListener('click', userInteraction, { once: true });
    window.addEventListener('scroll', userInteraction, { once: true });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('click', userInteraction);
      window.removeEventListener('scroll', userInteraction);
    };
  }, [deferredPrompt, forceShow]);

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
      // Reset counters on acceptance
      localStorage.removeItem(INSTALL_PROMPT_DISMISSED_COUNT_KEY);
    } else {
      console.log('User dismissed the install prompt');
      // Increment dismiss counter
      const dismissCount = parseInt(localStorage.getItem(INSTALL_PROMPT_DISMISSED_COUNT_KEY) || '0', 10);
      localStorage.setItem(INSTALL_PROMPT_DISMISSED_COUNT_KEY, (dismissCount + 1).toString());
    }
    
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
    localStorage.setItem(INSTALL_PROMPT_SHOWN_KEY, 'true');
    localStorage.setItem(INSTALL_PROMPT_LAST_SHOWN_KEY, Date.now().toString());
  };

  // Function to hide the install prompt
  const hideInstallPrompt = () => {
    setShowInstallPrompt(false);
    
    // Increment dismiss counter
    const dismissCount = parseInt(localStorage.getItem(INSTALL_PROMPT_DISMISSED_COUNT_KEY) || '0', 10);
    localStorage.setItem(INSTALL_PROMPT_DISMISSED_COUNT_KEY, (dismissCount + 1).toString());
    localStorage.setItem(INSTALL_PROMPT_LAST_SHOWN_KEY, Date.now().toString());
  };

  return {
    isInstalled,
    showInstallPrompt,
    installApp,
    hideInstallPrompt
  };
}
