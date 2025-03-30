import { Bot } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 mr-auto max-w-[80%] md:max-w-[70%]">
      <div className="bg-accent text-accent-foreground rounded-full p-2 mt-0.5">
        <Bot className="h-4 w-4" />
      </div>
      <div className="bg-muted p-3 rounded-lg min-w-[60px]">
        <div className="flex items-center space-x-1">
          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}