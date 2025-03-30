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
    const visibleMessages = messages.slice(-100); // Keep last 100 messages to prevent memory issues
    
    return (
      <main className="flex-1 overflow-y-auto px-4 py-4" ref={ref}>
        <div className="max-w-3xl mx-auto">
          {visibleMessages.map((message, index) => (
            <ChatMessage 
              key={index}
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
