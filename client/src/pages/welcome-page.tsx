import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useLocation } from "wouter";
import { useTheme } from "@/components/theme-provider";

export default function WelcomePage() {
  const [_, setLocation] = useLocation();
  const { theme } = useTheme();
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 border-b">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={theme === "dark" ? "/attached_assets/TTwW Logo v4 White.png" : "/attached_assets/TTwW Logo v4.png"} 
              alt="TTwW Logo" 
              className="w-10 h-10 object-contain"
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