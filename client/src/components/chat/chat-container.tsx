
import { forwardRef } from "react";
import ChatMessage from "./chat-message";
import TypingIndicator from "./typing-indicator";
import { Message } from "@shared/schema";

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
}

const ChatContainer = forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ messages, isTyping }, ref) => {
    const visibleMessages = messages.slice(-50); // Keep last 50 messages to prevent memory issues and improve performance
    
    return (
      <main className="flex-1 overflow-y-auto px-4 py-4" ref={ref}>
        <div className="max-w-3xl mx-auto">
          {visibleMessages.map((message, index) => (
            <ChatMessage 
              key={`${message.role}-${index}-${message.content.substring(0, 10)}`}
              role={message.role}
              content={message.content}
            />
          ))}
          
          {isTyping && <TypingIndicator />}
        </div>
      </main>
    );
  }
);

ChatContainer.displayName = "ChatContainer";

export default ChatContainer;
