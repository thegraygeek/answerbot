import { useState, useEffect } from 'react';
import { Message } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';

export function useChat() {
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  // Fetch chat history from server
  const { data, isLoading, refetch } = useQuery<{ messages: Message[] }>({
    queryKey: ['chat-history'],
    queryFn: async () => {
      const response = await apiRequest<{ messages: Message[] }>('/api/chat/history', { 
        method: 'GET',
        on401: 'returnNull'
      });
      
      // Initialize with welcome message if no messages exist
      if (!response || !response.messages || response.messages.length === 0) {
        const welcomeMessage: Message = { 
          role: 'assistant', 
          content: `Hello there! I'm the TTwW Answerbot. I provide concise tech answers in 50 words or less. What tech question can I help with today?` 
        };
        return { messages: [welcomeMessage] };
      }
      
      return response;
    },
    initialData: { messages: [] },
    staleTime: 30000, // 30 seconds
  });
  
  // Messages from server or empty array if loading/error
  const messages = data?.messages || [];

  // Function to send a message and get a response
  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    console.log("Sending message:", content);

    // Add user message optimistically to the UI
    const userMessage: Message = { role: 'user', content };
    console.log("Current message history before update:", 
      queryClient.getQueryData(['chat-history']));
    
    queryClient.setQueryData(['chat-history'], (oldData: any) => {
      console.log("Old data in update:", oldData);
      return {
        messages: [...(oldData?.messages || []), userMessage],
      };
    });
    
    console.log("Updated message history:", 
      queryClient.getQueryData(['chat-history']));
    
    setIsTyping(true);

    try {
      // Call API
      console.log("Calling API with message:", userMessage);
      const data = await apiRequest<Message>('/api/chat', {
        method: 'POST',
        body: JSON.stringify(userMessage)
      });
      
      console.log("API response:", data);
      
      // Refresh chat history to get latest messages
      console.log("Refreshing chat history...");
      await refetch();
      console.log("Chat history after refresh:", 
        queryClient.getQueryData(['chat-history']));
      
      // Stop typing indicator after a small delay
      setTimeout(() => {
        setIsTyping(false);
      }, 300);
    } catch (error) {
      console.error('Error getting response:', error);
      setIsTyping(false);
      
      // Add error message from bot optimistically
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I couldn't process your request. Please try again or check your internet connection."
      };
      
      queryClient.setQueryData(['chat-history'], (oldData: any) => ({
        messages: [...(oldData?.messages || []), errorMessage],
      }));
      
      toast({
        title: "Error",
        description: "Failed to get response from the server",
        variant: "destructive"
      });
    }
  };

  // Clear chat mutation
  const clearChatMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest<{ messages: Message[] }>('/api/chat/clear', { 
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['chat-history'], { messages: data.messages });
      toast({
        title: "New Chat Started",
        description: "Your conversation has been reset",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start a new chat",
        variant: "destructive"
      });
    }
  });
  
  // Start a new chat by clearing history
  const newChat = () => {
    clearChatMutation.mutate();
  };

  return {
    messages,
    isTyping,
    isLoading,
    sendMessage,
    newChat
  };
}
