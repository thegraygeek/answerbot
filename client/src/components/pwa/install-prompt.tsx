import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss?: () => void;
}

export default function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  const [animated, setAnimated] = useState(false);
  const [minimized, setMinimized] = useState(false);
  
  // Start animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle dismiss
  const handleDismiss = () => {
    setAnimated(false);
    setTimeout(() => {
      if (onDismiss) onDismiss();
    }, 300);
  };
  
  // Toggle minimized state
  const toggleMinimized = () => {
    setMinimized(!minimized);
  };
  
  // iOS detection
  const isIOS = typeof navigator !== 'undefined' && 
    /iPad|iPhone|iPod/.test(navigator.userAgent) && 
    !(window as any).MSStream;
    
  return (
    <>
      {/* Full prompt */}
      {!minimized && (
        <div className={`fixed z-50 inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${animated ? 'opacity-100' : 'opacity-0'}`}
            onClick={(e) => e.target === e.currentTarget && toggleMinimized()}>
          <div className={`fixed max-w-md w-11/12 left-1/2 top-1/2 transform -translate-x-1/2 ${animated ? '-translate-y-1/2 scale-100' : 'translate-y-full scale-95'} transition-all duration-300 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden`}>
            {/* Header */}
            <div className="relative h-24 bg-primary text-white flex items-center justify-center">
              <button
                onClick={handleDismiss}
                className="absolute right-2 top-2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold">Install TTwW Answerbot</h2>
                <p className="text-sm opacity-90 mt-1">Get the best experience</p>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-5">
              <div className="flex items-start space-x-4 mb-5">
                <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                    <path d="M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8z"></path>
                    <path d="M12 6a4 4 0 0 0-4 4v10h8V10a4 4 0 0 0-4-4z"></path>
                    <line x1="12" y1="16" x2="12" y2="19"></line>
                  </svg>
                </div>
                
                <div>
                  <h3 className="font-medium text-lg dark:text-white">Why install our app?</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-gray-700 dark:text-gray-300">
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Works offline when internet is unavailable
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Faster access without opening browser
                    </li>
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Full-screen experience without browser UI
                    </li>
                  </ul>
                </div>
              </div>
              
              {isIOS ? (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-4 text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">For iOS devices:</p>
                  <ol className="list-decimal ml-5 mt-1 text-blue-700 dark:text-blue-300 space-y-1">
                    <li>Tap the share button <span className="inline-block w-5 h-5 align-text-bottom bg-gray-300 dark:bg-gray-600 rounded text-center">↑</span> at the bottom of the screen</li>
                    <li>Scroll and tap <strong>Add to Home Screen</strong></li>
                    <li>Tap <strong>Add</strong> in the top right</li>
                  </ol>
                </div>
              ) : (
                <Button 
                  onClick={onInstall}
                  className="w-full py-5 text-base font-medium bg-primary hover:bg-primary/90 transition-colors"
                >
                  Install Answerbot Now
                </Button>
              )}
              
              <button 
                onClick={toggleMinimized}
                className="w-full text-center text-sm text-gray-500 dark:text-gray-400 mt-3 hover:underline"
              >
                Remind me later
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Minimized prompt */}
      {minimized && (
        <div 
          className={`fixed bottom-6 right-6 bg-primary text-white rounded-full shadow-lg p-3 cursor-pointer z-50 transition-all duration-300 ${animated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
          onClick={toggleMinimized}
        >
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8z"></path>
              <path d="M12 6a4 4 0 0 0-4 4v10h8V10a4 4 0 0 0-4-4z"></path>
              <line x1="12" y1="16" x2="12" y2="19"></line>
            </svg>
            <span className="font-medium">Install App</span>
          </div>
        </div>
      )}
    </>
  );
}
