import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss?: () => void;
}

export default function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-card border rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <img 
            src="/ttww-logo-dark.png" 
            alt="TTwW Answerbot" 
            className="w-10 h-10 mr-3 rounded-md" 
          />
          <h3 className="font-semibold text-lg">Install TTwW Answerbot</h3>
        </div>
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDismiss} 
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
      
      <p className="text-muted-foreground text-sm mb-3">
        Install this app on your device for quick access anytime, even offline.
      </p>
      
      <div className="flex justify-end gap-2">
        {onDismiss && (
          <Button variant="outline" size="sm" onClick={onDismiss}>
            Not now
          </Button>
        )}
        <Button variant="default" size="sm" onClick={onInstall}>
          Install app
        </Button>
      </div>
    </div>
  );
}