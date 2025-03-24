import { useEffect, useRef } from "react";
import ChatContainer from "@/components/chat/chat-container";
import InputArea from "@/components/chat/input-area";
import { useChat } from "@/hooks/use-chat";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import InstallPrompt from "@/components/pwa/install-prompt";
import { usePwa } from "@/hooks/use-pwa";

export default function Home() {
  const { 
    messages, 
    isTyping, 
    sendMessage,
    clearChat 
  } = useChat();
  
  const { showInstallPrompt, installApp } = usePwa();

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
            <div className="h-9 w-9 rounded bg-transparent flex items-center justify-center">
              <img 
                src="/images/ttww-logo-dark.svg" 
                alt="TTwW Logo" 
                className="h-8 w-8 dark:hidden" 
              />
              <img 
                src="/images/ttww-logo-light.svg" 
                alt="TTwW Logo" 
                className="h-8 w-8 hidden dark:block" 
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
            <button 
              onClick={clearChat}
              className="text-sm px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors"
              aria-label="Start a new chat"
            >
              New Chat
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <ChatContainer 
        ref={chatContainerRef}
        messages={messages}
        isTyping={isTyping}
      />

      {/* Input Area */}
      <InputArea onSendMessage={sendMessage} />
      
      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <InstallPrompt onInstall={installApp} />
      )}
    </div>
  );
}
