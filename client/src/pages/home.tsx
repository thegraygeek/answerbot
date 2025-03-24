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
            <div className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-gray-900 dark:text-white">
                <path d="M10 2C5 2 3 5 2 9h1c0-3 3-5 7-5s7 2 7 5h1c-1-4-3-7-8-7zM4 9c0 3 1 4 2 5s2 1 4 0c2 1 3 1 4 0s2-2 2-5h-1c0 3 0 3-1 4s-2-1-3-2c-1 1-2 2-3 2s-1-1-1-4h-1z" fill="currentColor" />
                <circle cx="7" cy="6" r="1" fill="currentColor" />
                <circle cx="13" cy="6" r="1" fill="currentColor" />
                <path d="M7 13c-1 0-2 1-2 3s1 3 2 3 2-1 2-3-1-3-2-3zm-3 3h3M14 16h3" stroke="currentColor" strokeWidth="1" />
              </svg>
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
