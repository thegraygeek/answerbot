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
    queryKey: ['/api/chat/history'],  // Use the actual API path as the query key
    queryFn: async () => {
      console.log("Fetching chat history");
      try {
        const response = await apiRequest<{ messages: Message[] }>('/api/chat/history', { 
          method: 'GET',
          on401: 'returnNull'
        });
        
        console.log("Chat history response:", response);
        
        // Initialize with welcome message if no messages exist
        if (!response || !response.messages || response.messages.length === 0) {
          console.log("No messages found, creating welcome message");
          const welcomeMessage: Message = { 
            role: 'assistant', 
            content: `Hello there! I'm the TTwW Answerbot. I provide concise tech answers in 50 words or less. What tech question can I help with today?` 
          };
          return { messages: [welcomeMessage] };
        }
        
        return response;
      } catch (error) {
        console.error("Error fetching chat history:", error);
        // Provide a default response on error
        const welcomeMessage: Message = { 
          role: 'assistant', 
          content: `Hello there! I'm the TTwW Answerbot. I provide concise tech answers in 50 words or less. What tech question can I help with today?` 
        };
        return { messages: [welcomeMessage] };
      }
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
      queryClient.getQueryData(['/api/chat/history']));
    
    queryClient.setQueryData(['/api/chat/history'], (oldData: any) => {
      console.log("Old data in update:", oldData);
      return {
        messages: [...(oldData?.messages || []), userMessage],
      };
    });
    
    console.log("Updated message history:", 
      queryClient.getQueryData(['/api/chat/history']));
    
    setIsTyping(true);

    try {
      // Call API
      console.log("Calling API with message:", userMessage);
      const assistantResponse = await apiRequest<Message>('/api/chat', {
        method: 'POST',
        body: JSON.stringify(userMessage)
      });
      
      console.log("API response:", assistantResponse);
      
      // Add the assistant's response directly to the chat history
      if (assistantResponse && assistantResponse.role === 'assistant') {
        console.log("Adding assistant response to history:", assistantResponse);
        
        // Update the message history in the query cache
        queryClient.setQueryData(['/api/chat/history'], (oldData: any) => {
          const oldMessages = oldData?.messages || [];
          console.log("Previous messages:", oldMessages);
          
          // Create new messages array with the assistant's response
          return {
            messages: [...oldMessages, assistantResponse],
          };
        });
      } else {
        console.error("Invalid response from server:", assistantResponse);
      }
      
      console.log("Chat history after adding response:", 
        queryClient.getQueryData(['/api/chat/history']));
      
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
      
      queryClient.setQueryData(['/api/chat/history'], (oldData: any) => ({
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
      queryClient.setQueryData(['/api/chat/history'], { messages: data.messages });
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
