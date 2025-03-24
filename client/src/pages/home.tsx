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
    sendMessage 
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
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8z"></path>
                <path d="M12 6a4 4 0 0 0-4 4v10h8V10a4 4 0 0 0-4-4z"></path>
                <line x1="12" y1="16" x2="12" y2="19"></line>
              </svg>
            </div>
            <div>
              <h1 className="font-semibold text-lg">TTwW Answerbot</h1>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-1"></span>
                <span>Your friendly tech explainer</span>
              </div>
            </div>
          </div>
          
          <ThemeToggle />
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
