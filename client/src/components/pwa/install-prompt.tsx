import { Button } from "@/components/ui/button";

interface InstallPromptProps {
  onInstall: () => void;
}

export default function InstallPrompt({ onInstall }: InstallPromptProps) {
  return (
    <div className="fixed bottom-20 inset-x-0 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mx-auto max-w-md border border-gray-200 dark:border-gray-700 flex items-center justify-between transition-colors">
        <div className="flex items-center">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center text-white mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <path d="M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8z"></path>
              <path d="M12 6a4 4 0 0 0-4 4v10h8V10a4 4 0 0 0-4-4z"></path>
              <line x1="12" y1="16" x2="12" y2="19"></line>
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Install Answerbot</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Add to home screen for offline access</p>
          </div>
        </div>
        <Button 
          onClick={onInstall}
          className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm"
        >
          Install
        </Button>
      </div>
    </div>
  );
}
