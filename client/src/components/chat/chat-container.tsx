import { forwardRef } from 'react';
import ChatMessage from './chat-message';
import TypingIndicator from './typing-indicator';
import { Message } from '@shared/schema';

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
}

const ChatContainer = forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ messages, isTyping }, ref) => {
    return (
      <div 
        ref={ref}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-background"
      >
        {messages.map((message, i) => (
          <ChatMessage 
            key={i} 
            role={message.role as 'user' | 'assistant'} 
            content={message.content} 
          />
        ))}
        
        {isTyping && <TypingIndicator />}
        
        {/* Empty div to ensure scroll to bottom works */}
        <div className="h-1" />
      </div>
    );
  }
);

ChatContainer.displayName = 'ChatContainer';

export default ChatContainer;