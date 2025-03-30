import { useState, useEffect } from 'react';
import { Message } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

// Define initial welcome message
const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: `Hello! 👋 I'm the TTwW Answerbot.

I'm here to help explain technology in a way that's easy to understand. Feel free to ask me about:

• How specific technologies work
• The meaning of tech terms and acronyms
• Troubleshooting common tech problems
• Advice on learning new tech skills

What would you like to know about today?`
};

export function useChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);

  // Load messages from localStorage on initial load
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat_messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
        // Fallback to welcome message if there's an error
        setMessages([WELCOME_MESSAGE]);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Optimistically add user message to the chat
    const userMessage: Message = { role: 'user', content };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      // Add assistant response to chat
      setMessages(prevMessages => [
        ...prevMessages, 
        { role: 'assistant', content: data.message }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "There was a problem connecting to the assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem('chat_messages');
  };

  return {
    messages,
    isTyping,
    sendMessage,
    clearChat
  };
}