import { forwardRef } from "react";
import ChatMessage from "./chat-message";
import TypingIndicator from "./typing-indicator";
import { Message } from "../../../shared/schema";

interface ChatContainerProps {
  messages: Message[];
  isTyping: boolean;
}

const ChatContainer = forwardRef<HTMLDivElement, ChatContainerProps>(
  ({ messages, isTyping }, ref) => {
    return (
      <main 
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900" 
        ref={ref}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}
          
          {isTyping && <TypingIndicator />}
          
          {/* Spacer for better scrolling to bottom */}
          <div className="h-4" />
        </div>
      </main>
    );
  }
);

ChatContainer.displayName = "ChatContainer";

export default ChatContainer;
