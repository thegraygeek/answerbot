
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { usePwa } from "@/hooks/use-pwa";

export function PwaInstallPrompt() {
  const { showInstallPrompt, hideInstallPrompt, installApp, isInstalled } = usePwa();

  if (!showInstallPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mx-auto max-w-md">
      <button onClick={hideInstallPrompt} className="absolute top-2 right-2">
        <X className="h-4 w-4" />
      </button>
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold">Install App</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Install our app for a better experience with these benefits:
        </p>
        <ul className="space-y-2">
          <li className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Faster access to features
          </li>
          <li className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Works offline
          </li>
          <li className="flex items-center text-sm">
            <svg className="w-4 h-4 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            Full-screen experience
          </li>
        </ul>
        <Button onClick={installApp} className="w-full">
          Install Now
        </Button>
      </div>
    </div>
  );
}
