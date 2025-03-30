import { useMemo } from "react";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = useMemo(() => role === 'user', [role]);
  
  return (
    <div className={`mb-4 flex ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="h-9 w-9 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8z"></path>
            <path d="M12 6a4 4 0 0 0-4 4v10h8V10a4 4 0 0 0-4-4z"></path>
            <line x1="12" y1="16" x2="12" y2="19"></line>
          </svg>
        </div>
      )}
      
      <div className={`${isUser ? 'mr-3' : 'ml-3'} ${
        isUser 
          ? 'bg-primary text-white'
          : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'
        } rounded-lg px-4 py-2 max-w-[80%] shadow-sm`}>
        <div className="text-sm whitespace-pre-wrap">
          {content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-2' : ''}>
              {line}
            </p>
          ))}
        </div>
      </div>
      
      {isUser && (
        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      )}
    </div>
  );
}
