import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwa() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user has already interacted with the prompt
      const hasSeenPrompt = localStorage.getItem('pwa_prompt_seen');
      if (!hasSeenPrompt || Date.now() - parseInt(hasSeenPrompt) > 24 * 60 * 60 * 1000) {
        // If user hasn't seen the prompt in 24 hours, show it
        // Delay showing prompt to ensure better UX
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 3000);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      localStorage.setItem('pwa_installed', 'true');
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check user interaction on page
    const recordInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        
        // After user interacts and if we have the deferred prompt, show the install prompt
        if (deferredPrompt && !isInstalled) {
          setTimeout(() => {
            setShowInstallPrompt(true);
          }, 5000);
        }
      }
    };

    window.addEventListener('click', recordInteraction);
    window.addEventListener('keydown', recordInteraction);
    window.addEventListener('scroll', recordInteraction);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('click', recordInteraction);
      window.removeEventListener('keydown', recordInteraction);
      window.removeEventListener('scroll', recordInteraction);
    };
  }, [deferredPrompt, hasInteracted, isInstalled]);

  const installApp = async () => {
    if (!deferredPrompt) return;
    
    try {
      // Show the prompt
      await deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('User dismissed the install prompt');
        // Record that user has seen the prompt
        localStorage.setItem('pwa_prompt_seen', Date.now().toString());
      }
    } catch (err) {
      console.error('Error installing app:', err);
    } finally {
      // Clear the deferredPrompt so it can't be used again
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const hideInstallPrompt = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa_prompt_seen', Date.now().toString());
  };

  return {
    isInstalled,
    showInstallPrompt,
    hideInstallPrompt,
    installApp
  };
}