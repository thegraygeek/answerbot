import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-full bg-primary/90 flex-shrink-0 flex items-center justify-center text-white">
        <Bot className="h-5 w-5" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex gap-1.5 items-center h-6">
          {[0, 1, 2].map((i) => (
            <span 
              key={i}
              className={cn(
                "h-2.5 w-2.5 rounded-full bg-gray-400 dark:bg-gray-500 inline-block",
                "animate-pulse",
              )}
              style={{ 
                animationDelay: `${i * 0.2}s`,
                opacity: 0.6 + (i * 0.1)
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
