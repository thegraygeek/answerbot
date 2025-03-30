import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePwa } from '@/hooks/use-pwa';
import { motion, AnimatePresence } from 'framer-motion';

export function PwaInstallPrompt() {
  const { showInstallPrompt, hideInstallPrompt, installApp } = usePwa();

  if (!showInstallPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative bg-card max-w-md w-full rounded-lg shadow-lg p-6 border border-border"
        >
          <button
            onClick={hideInstallPrompt}
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground rounded-full p-1"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center mb-4">
            <div className="mb-2 p-3 bg-primary/10 rounded-full">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Install TTwW Answerbot</h2>
            <p className="text-muted-foreground mt-2">
              Get quick answers about tech whenever you need them, even when offline!
            </p>
          </div>

          <div className="space-y-4 mb-4">
            <div className="flex items-start">
              <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5">
                <Download size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm">
                  Install this app on your device to access it quickly and easily,
                  without opening your browser.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={installApp} className="w-full" size="lg">
              Install App
            </Button>
            <Button onClick={hideInstallPrompt} variant="outline" size="lg">
              Not Now
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}