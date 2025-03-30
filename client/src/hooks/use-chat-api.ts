import { useState } from "react";
import { Message } from "@shared/schema";

interface ChatState {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
}

/**
 * Hook for managing chat state and API interactions
 */
export function useChatApi() {
  const [state, setState] = useState<ChatState>({
    messages: [
      { 
        role: "assistant", 
        content: "Hello! How can I help you understand technology better today?" 
      }
    ],
    isTyping: false,
    error: null
  });

  /**
   * Send a message to the chat API
   */
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // Create a new user message
    const userMessage: Message = { role: "user", content };
    
    // Update state with user message and typing indicator
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
      error: null
    }));

    try {
      // Send the message to the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userMessage)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to get a response");
      }

      // Parse the assistant's response
      const assistantMessage: Message = await response.json();
      
      // Update state with the assistant's response
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isTyping: false
      }));
    } catch (error) {
      console.error("Chat error:", error);
      
      setState(prev => ({
        ...prev,
        isTyping: false,
        error: error instanceof Error ? error.message : "An unknown error occurred"
      }));
    }
  };

  /**
   * Clear the chat history
   */
  const clearChat = () => {
    setState({
      messages: [
        { 
          role: "assistant", 
          content: "Hello! How can I help you understand technology better today?" 
        }
      ],
      isTyping: false,
      error: null
    });
  };

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    error: state.error,
    sendMessage,
    clearChat
  };
}