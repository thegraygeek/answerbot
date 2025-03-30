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

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (content: string) => {
    try {
      setIsTyping(true);

      // Add user message
      const userMessage: Message = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      // Get bot response
      const data = await apiRequest<Message>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ content })
      });

      // Add bot response after a small delay to simulate typing
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          setMessages(prev => [...prev, data]);
          setIsTyping(false);
          resolve();
        }, 500);
      });

      await timeoutPromise;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTyping(false);
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