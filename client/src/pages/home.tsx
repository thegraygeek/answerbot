import { useEffect, useRef, useState } from "react";
import { usePwa } from "@/hooks/use-pwa";
import ChatContainer from "@/components/chat/chat-container";
import InputArea from "@/components/chat/input-area";
import { useChat } from "@/hooks/use-chat";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PwaInstallPrompt } from "@/components/pwa/install-prompt";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, RefreshCw, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { 
    messages, 
    isTyping, 
    sendMessage,
    clearChat 
  } = useChat();
  
  const { showInstallPrompt, installApp } = usePwa();
  const { toast } = useToast();
  const { authStatus, refreshAuth, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  // Get latest messages and scroll to bottom
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of TTwW Answerbot"
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoggingOut(false);
    }
  };

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
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="gap-1 text-sm font-normal"
                >
                  <User className="h-4 w-4 mr-1" />
                  {authStatus.firstName || 'User'}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={refreshAuth}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Refresh Session</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} disabled={loggingOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
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
    </div>
  );
}
