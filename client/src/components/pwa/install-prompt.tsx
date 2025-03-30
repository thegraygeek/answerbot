import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss?: () => void;
}

export default function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:right-auto md:w-80 bg-card border border-primary/20 rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <img 
            src="/icons/icon-192x192.png" 
            alt="TTwW Answerbot" 
            className="w-9 h-9 mr-2 rounded-md" 
          />
          <h3 className="font-medium">Install App</h3>
        </div>
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDismiss} 
            className="h-7 w-7 -mt-1 -mr-1"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
      
      <p className="text-muted-foreground text-sm mb-3">
        Install TTwW Answerbot for quick access, even when offline.
      </p>
      
      <div className="flex justify-end">
        <Button 
          variant="default" 
          size="sm" 
          onClick={onInstall}
          className="px-3"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Install
        </Button>
      </div>
    </div>
  );
}