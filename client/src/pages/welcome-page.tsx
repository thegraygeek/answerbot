import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";
import { useState, useEffect } from "react";

export default function WelcomePage() {
  const [_, setLocation] = useLocation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  
  // Add a small delay to ensure the page is fully loaded
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Dynamically determine logo paths based on the theme
  const logoPath = theme === "dark" 
    ? "/ttww-logo-light.png" 
    : "/ttww-logo-dark.png";
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={logoPath}
              alt="TTwW Logo" 
              className="w-10 h-10 object-contain"
              onError={(e) => {
                // Fallback if image fails to load
                console.error("Logo failed to load:", logoPath);
                e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cpath d='M12 16v-4'%3E%3C/path%3E%3Cpath d='M12 8h.01'%3E%3C/path%3E%3C/svg%3E";
              }}
            />
            <h1 className="text-xl font-bold">TTwW Answerbot</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 rounded-lg shadow-lg bg-card text-card-foreground">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Welcome to TTwW Answerbot</h2>
            <p className="text-muted-foreground">
              Your friendly assistant designed to help explain technology in a clear, 
              easy-to-understand way for adult learners.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setLocation("/chat")}
            >
              Start Chatting
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Ask any technology question, and get clear, helpful explanations designed for adult learners.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}