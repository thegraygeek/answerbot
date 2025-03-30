import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = useMemo(() => role === 'user', [role]);
  
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="h-9 w-9 rounded-full bg-primary/90 flex-shrink-0 flex items-center justify-center text-white">
          <Bot className="h-5 w-5" />
        </div>
      )}
      
      <div 
        className={`
          ${isUser ? 'order-1' : ''} 
          ${isUser 
            ? 'bg-primary text-white dark:bg-primary/90'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100'
          } 
          rounded-lg px-4 py-3 max-w-[85%] md:max-w-[75%] shadow-sm
        `}
      >
        {isUser ? (
          <div className="text-sm whitespace-pre-wrap">
            {content}
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-300">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
