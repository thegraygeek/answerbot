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
            <div className="h-10 w-10 flex items-center justify-center relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="h-8 w-8 dark:hidden">
                <path d="M25 5C16 5 10 9 8 20h2c1-9 8-12 15-12s14 3 15 12h2c-2-11-8-15-17-15zm-12 16c-1 8 2 12 4 13s5 0 8-2c3 2 5 3 8 2s5-5 4-13h-2c0 7-1 9-3 10s-5-1-7-3c-2 2-5 4-7 3s-3-3-3-10h-2zm5-7c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm14 0c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm-14 2c.5 0 1 .5 1 1s-.5 1-1 1-1-.5-1-1 .5-1 1-1zm14 0c.5 0 1 .5 1 1s-.5 1-1 1-1-.5-1-1 .5-1 1-1zm-14 14c-2 0-4 2-4 5s2 5 4 5 4-2 4-5-2-5-4-5zm0 2c1 0 2 1 2 3s-1 3-2 3-2-1-2-3 1-3 2-3zm0 1c-1 0-1 1-1 2s0 2 1 2 1-1 1-2-0-2-1-2zm-15-1h5v1h-5v-1zm25 0h5v1h-5v-1z" fill="black"/>
              </svg>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="h-8 w-8 hidden dark:block">
                <path d="M25 5C16 5 10 9 8 20h2c1-9 8-12 15-12s14 3 15 12h2c-2-11-8-15-17-15zm-12 16c-1 8 2 12 4 13s5 0 8-2c3 2 5 3 8 2s5-5 4-13h-2c0 7-1 9-3 10s-5-1-7-3c-2 2-5 4-7 3s-3-3-3-10h-2zm5-7c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm14 0c-2 0-3 1-3 3s1 3 3 3 3-1 3-3-1-3-3-3zm-14 2c.5 0 1 .5 1 1s-.5 1-1 1-1-.5-1-1 .5-1 1-1zm14 0c.5 0 1 .5 1 1s-.5 1-1 1-1-.5-1-1 .5-1 1-1zm-14 14c-2 0-4 2-4 5s2 5 4 5 4-2 4-5-2-5-4-5zm0 2c1 0 2 1 2 3s-1 3-2 3-2-1-2-3 1-3 2-3zm0 1c-1 0-1 1-1 2s0 2 1 2 1-1 1-2-0-2-1-2zm-15-1h5v1h-5v-1zm25 0h5v1h-5v-1z" fill="white"/>
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
