import * as React from 'react';
import { Switch, Route } from "wouter";
import NotFound from "./pages/not-found";
import { Button } from './components/ui/button';
import { ThemeToggle } from './components/ui/theme-toggle';

// Simplified welcome component
function SimpleWelcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-3xl font-bold mb-6">TTwW Answerbot</h1>
      <p className="text-lg mb-6 text-center max-w-md">
        Your friendly assistant designed to help explain technology in a clear, easy-to-understand way.
      </p>
      <div className="flex items-center gap-4">
        <Button>Get Started</Button>
        <ThemeToggle />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={SimpleWelcome} />
      <Route component={NotFound} />
    </Switch>
  );
}