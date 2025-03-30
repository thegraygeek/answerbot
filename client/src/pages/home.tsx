import { useEffect, useRef } from "react";
import ChatContainer from "@/components/chat/chat-container";
import InputArea from "@/components/chat/input-area";
import { useChat } from "@/hooks/use-chat";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, RefreshCw } from "lucide-react";

export default function Home() {
  const { 
    messages, 
    isTyping, 
    isLoading,
    sendMessage,
    newChat 
  } = useChat();
  
  // Get latest messages and scroll to bottom
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 flex items-center justify-center">
              <img 
                src="/ttww-logo-dark.png" 
                alt="TTwW Logo" 
                className="h-10 w-auto dark:hidden" 
              />
              <img 
                src="/ttww-logo-light.png" 
                alt="TTwW Logo" 
                className="h-10 w-auto hidden dark:block" 
              />
            </div>
            <div>
              <h1 className="font-semibold text-lg">TTwW Answerbot</h1>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                <span>Tech explained for adult learners</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={newChat}
              size="sm"
              variant="outline"
              className="gap-1.5 text-sm"
              aria-label="Start a new chat"
            >
              <PlusCircle className="h-4 w-4" />
              New Chat
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Chat Container with Loading State */}
      {isLoading ? (
        <div className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
            <div className="flex items-start gap-3 justify-end">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-12 w-full" />
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to TTwW Answerbot</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
            Ask me any technology question, and I'll provide clear explanations designed for adult learners.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
            <Button 
              variant="outline" 
              className="justify-start text-left"
              onClick={() => sendMessage("What are the most important settings to check for Wi-Fi security?")}
            >
              🔒 How can I make my Wi-Fi more secure?
            </Button>
            <Button 
              variant="outline" 
              className="justify-start text-left"
              onClick={() => sendMessage("What's the difference between cloud storage and local storage?")}
            >
              💾 Cloud vs. local storage explained
            </Button>
            <Button 
              variant="outline" 
              className="justify-start text-left"
              onClick={() => sendMessage("How does two-factor authentication work and why should I use it?")}
            >
              🔐 Explain two-factor authentication
            </Button>
            <Button 
              variant="outline" 
              className="justify-start text-left"
              onClick={() => sendMessage("What are common smartphone issues and how can I troubleshoot them?")}
            >
              📱 Troubleshoot common smartphone problems
            </Button>
          </div>
        </div>
      ) : (
        <ChatContainer 
          ref={chatContainerRef}
          messages={messages}
          isTyping={isTyping}
        />
      )}

      {/* Input Area */}
      <InputArea onSendMessage={sendMessage} />
    </div>
  );
}
