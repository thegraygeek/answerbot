import { cn } from "@/lib/utils";

export default function TypingIndicator() {
  return (
    <div className="mb-4 flex">
      <div className="h-9 w-9 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8z"></path>
          <path d="M12 6a4 4 0 0 0-4 4v10h8V10a4 4 0 0 0-4-4z"></path>
          <line x1="12" y1="16" x2="12" y2="19"></line>
        </svg>
      </div>
      <div className="ml-3 bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <span 
              key={i}
              className={cn(
                "h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500",
                "animate-bounce",
              )}
              style={{ 
                animationDelay: `${i * 0.2}s`,
                animationDuration: "1.5s"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
