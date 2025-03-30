
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import "./index.css";

// Create a QueryClient instance
const queryClient = new QueryClient();

// Header component with logo
function Header() {
  return (
    <header className="p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src="/icons/icon-192x192.png" 
            alt="TTwW Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-bold">TTwW Answerbot</h1>
        </div>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
          New Chat
        </button>
      </div>
    </header>
  );
}

// ChatMessage component
function ChatMessage({ role, content }) {
  const isUser = role === 'user';
  return (
    <div className={`p-4 ${isUser ? 'bg-blue-100' : 'bg-white'}`}>
      <div className="max-w-3xl mx-auto">
        <div className="font-bold mb-2">{isUser ? 'You' : 'Answerbot'}</div>
        <div>{content}</div>
      </div>
    </div>
  );
}

// Input component
function ChatInput() {
  return (
    <div className="p-4 border-t">
      <div className="max-w-3xl mx-auto flex">
        <input 
          type="text" 
          placeholder="Type your message here..." 
          className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded-r-md">
          Send
        </button>
      </div>
    </div>
  );
}

// Simple welcome page
function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Welcome to TTwW Answerbot</h2>
          <p className="mb-8">
            Your friendly assistant designed to help explain technology in a clear, 
            easy-to-understand way for adult learners.
          </p>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-md font-medium">
            Start Chatting
          </button>
        </div>
      </main>
    </div>
  );
}

// Simple chat interface
function ChatPage() {
  const messages = [
    { role: 'assistant', content: 'Hello! How can I help you understand technology better today?' },
    { role: 'user', content: 'Can you explain what a PWA is?' },
    { role: 'assistant', content: 'A Progressive Web App (PWA) is a type of application that\'s delivered through the web but provides a user experience similar to a native app. PWAs can work offline, send notifications, and even be installed on your home screen, just like regular apps from an app store.' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            role={message.role} 
            content={message.content} 
          />
        ))}
      </main>
      <ChatInput />
    </div>
  );
}

// Main App component
function App() {
  // For now, just show WelcomePage
  return <WelcomePage />;
}

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
