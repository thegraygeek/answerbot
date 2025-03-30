
import { useState, useEffect, createContext, useContext } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./index.css";

// Create a QueryClient instance
const queryClient = new QueryClient();

// Create a context for theme
const ThemeContext = createContext({
  theme: "light",
  setTheme: (theme) => {},
});

// Create a context for navigation
const NavigationContext = createContext({
  currentPage: "welcome",
  navigateTo: (page) => {},
});

// Create a context for chat
const ChatContext = createContext({
  messages: [],
  addMessage: (message) => {},
  isTyping: false,
});

// Theme toggle component
function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  
  return (
    <button 
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
}

// Header component with logo
function Header() {
  const { navigateTo } = useContext(NavigationContext);
  const { theme } = useContext(ThemeContext);
  
  return (
    <header className="p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={theme === "dark" ? "/icons/icon-192x192.png" : "/icons/icon-192x192.png"} 
            alt="TTwW Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold">TTwW Answerbot</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigateTo("chat")}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            New Chat
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

// ChatMessage component
function ChatMessage({ role, content }) {
  const isUser = role === 'user';
  
  return (
    <div className={`p-4 ${isUser ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-white dark:bg-gray-800'}`}>
      <div className="max-w-3xl mx-auto">
        <div className="font-bold mb-2">{isUser ? 'You' : 'Answerbot'}</div>
        <div className="whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
}

// Typing indicator
function TypingIndicator() {
  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}

// Input component
function ChatInput() {
  const [input, setInput] = useState("");
  const { addMessage } = useContext(ChatContext);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      addMessage({ role: 'user', content: input });
      setInput("");
    }
  };
  
  return (
    <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..." 
          className="flex-1 p-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-md disabled:opacity-50"
          disabled={!input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}

// Simple welcome page
function WelcomePage() {
  const { navigateTo } = useContext(NavigationContext);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      <Header />
      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Welcome to TTwW Answerbot</h2>
          <p className="mb-8">
            Your friendly assistant designed to help explain technology in a clear, 
            easy-to-understand way for adult learners.
          </p>
          <button 
            onClick={() => navigateTo("chat")}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium"
          >
            Start Chatting
          </button>
        </div>
      </main>
    </div>
  );
}

// Simple chat interface
function ChatPage() {
  const { messages, isTyping } = useContext(ChatContext);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    window.scrollTo(0, document.body.scrollHeight);
  }, [messages]);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      <Header />
      <main className="flex-1 overflow-auto">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            role={message.role} 
            content={message.content} 
          />
        ))}
        {isTyping && <TypingIndicator />}
      </main>
      <ChatInput />
    </div>
  );
}

// Main App component
function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    // Check localStorage or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState("welcome");
  
  // Chat state
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! How can I help you understand technology better today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Handle theme changes
  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);
  
  // Handle adding messages
  const addMessage = async (message) => {
    // Add user message immediately
    setMessages(prev => [...prev, message]);
    
    // Simulate bot thinking
    setIsTyping(true);
    
    // Wait for 1-2 seconds to simulate processing
    setTimeout(() => {
      // Add bot response
      const responses = {
        'Can you explain what a PWA is?': 'A Progressive Web App (PWA) is a type of application that\'s delivered through the web but provides a user experience similar to a native app. PWAs can work offline, send notifications, and even be installed on your home screen, just like regular apps from an app store.',
        'What is the cloud?': 'The "cloud" refers to servers accessed over the internet that store and manage data. Instead of keeping files on your device, cloud computing lets you store them online so you can access them from anywhere with an internet connection. Think of it as renting storage space and computing power from companies like Google or Amazon, rather than buying and maintaining your own physical servers.',
        'How does Wi-Fi work?': 'Wi-Fi works by using radio waves to transmit data between your device and a router. Your router converts internet data into radio signals and broadcasts them. Your devices (phones, computers) have special receivers that pick up these signals and convert them back into data. It\'s similar to a two-way radio communication but designed specifically for digital data transfer.',
      };
      
      // Get response based on user message, or use default
      let botResponse = responses[message.content];
      if (!botResponse) {
        botResponse = "I'm here to help explain technology concepts in simple terms. Feel free to ask me about any tech topic you're curious about!";
      }
      
      setMessages(prev => [...prev, { role: 'assistant', content: botResponse }]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Provide context values
  const themeValue = { theme, setTheme };
  const navigationValue = { 
    currentPage, 
    navigateTo: (page) => setCurrentPage(page)
  };
  const chatValue = { messages, addMessage, isTyping };
  
  return (
    <ThemeContext.Provider value={themeValue}>
      <NavigationContext.Provider value={navigationValue}>
        <ChatContext.Provider value={chatValue}>
          {currentPage === "welcome" ? <WelcomePage /> : <ChatPage />}
        </ChatContext.Provider>
      </NavigationContext.Provider>
    </ThemeContext.Provider>
  );
}

// Add dark mode class to Tailwind
document.documentElement.classList.add('js');

// Get the container
const container = document.getElementById("root");

// Render the app
if (container) {
  const root = createRoot(container);
  root.render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
}
