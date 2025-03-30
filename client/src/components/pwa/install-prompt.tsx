import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface InstallPromptProps {
  onInstall: () => void;
  onDismiss?: () => void;
}

export default function InstallPrompt({ onInstall, onDismiss }: InstallPromptProps) {
  return (
    <div className="fixed bottom-20 right-4 md:bottom-4 md:right-4 bg-card border rounded-lg shadow-lg p-3 z-50 animate-in fade-in">
      <div className="flex items-center gap-2">
        <div className="flex-grow">
          <p className="text-sm font-medium">
            Install for offline use
          </p>
        </div>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={onInstall}
          className="h-8 px-2"
        >
          <Download className="h-4 w-4 mr-1" />
          Install
        </Button>
        
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onDismiss} 
            className="h-6 w-6"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </div>
  );
}