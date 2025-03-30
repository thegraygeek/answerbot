import { useState, useEffect } from 'react';
import { Message } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  // Load initial messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    } else {
      // Add welcome message if no history
      const initialMessages: Message[] = [
        {
          role: 'assistant',
          content: "👋 Welcome to TTwW Answerbot! I'm here to help you better understand technology with clear, straightforward explanations."
        },
        {
          role: 'assistant',
          content: "As you build your tech knowledge, feel free to ask about any technology concepts you'd like to understand better. Some ideas to get started:\n\n• How can I make my WiFi connection more reliable?\n• What security measures should I use for my online accounts?\n• What's the difference between cloud storage and local storage?\n• How can I troubleshoot common smartphone issues?"
        }
      ];
      setMessages(initialMessages);
      localStorage.setItem('chatMessages', JSON.stringify(initialMessages));
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);

  // Function to send a message and get a response
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Call API
      const data = await apiRequest<Message>('/api/chat', {
        method: 'POST',
        body: JSON.stringify(userMessage)
      });
      
      // Add bot response after a small delay to simulate typing
      const timeout = setTimeout(() => {
        setMessages(prev => [...prev, data]);
        setIsTyping(false);
      }, 500);

      // Cleanup function
      const cleanup = () => clearTimeout(timeout);
      return cleanup;
    } catch (error) {
      console.error('Error getting response:', error);
      setIsTyping(false);
      
      // Add error message from bot
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Response && error.status === 401 
          ? "Your session has expired. Please log in again."
          : "I'm sorry, I couldn't process your request. Please try again."
      };
      setMessages(prev => [...prev, errorMessage]);
      
      // Handle different types of errors
      let errorDescription = "Failed to get response from the server";
      if (error instanceof Error) {
        errorDescription = error.message;
      } else if (error instanceof Response) {
        switch (error.status) {
          case 401:
            errorDescription = "Session expired - redirecting to login";
            setTimeout(() => window.location.href = '/', 2000);
            break;
          case 429:
            errorDescription = "Too many requests, please wait a moment";
            break;
          case 500:
            errorDescription = "Server error, please try again later";
            break;
        }
      }
      
      toast({
        title: "Error",
        description: errorDescription,
        variant: "destructive"
      });
    }
  };

  // Clear chat history
  const clearChat = () => {
    const initialMessages: Message[] = [
      {
        role: 'assistant',
        content: "👋 Welcome to TTwW Answerbot! I'm here to help you better understand technology with clear, straightforward explanations."
      },
      {
        role: 'assistant',
        content: "As you build your tech knowledge, feel free to ask about any technology concepts you'd like to understand better. Some ideas to get started:\n\n• How can I make my WiFi connection more reliable?\n• What security measures should I use for my online accounts?\n• What's the difference between cloud storage and local storage?\n• How can I troubleshoot common smartphone issues?"
      }
    ];
    
    setMessages(initialMessages);
    localStorage.setItem('chatMessages', JSON.stringify(initialMessages));
    
    toast({
      title: "Chat cleared",
      description: "Your conversation history has been cleared"
    });
  };

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat
  };
}
