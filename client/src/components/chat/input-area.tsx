import { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { X, Send, HelpCircle, Mic, MicOff } from "lucide-react";
import { useVoiceContext } from "../../hooks/use-voice-context";

interface InputAreaProps {
  onSendMessage: (message: string) => void;
}

export default function InputArea({ onSendMessage }: InputAreaProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { 
    isListening, 
    startListening, 
    stopListening, 
    hasRecognitionSupport 
  } = useVoiceContext();
  
  // Auto-resize the textarea, with a lower max height for mobile
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const maxHeight = window.innerWidth < 640 ? 100 : 200; // Lower max height on mobile
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [message]);
  
  // Listen for speech recognition results
  useEffect(() => {
    if (hasRecognitionSupport) {
      const handleSpeechResult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setMessage(prev => prev + transcript);
      };
      
      // Set up the SpeechRecognition API
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = handleSpeechResult;
        
        return () => {
          recognition.onresult = null;
        };
      }
    }
  }, [hasRecognitionSupport]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const toggleMicrophone = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  return (
    <div className="sticky bottom-0 w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 z-10">
      <div className="max-w-3xl mx-auto px-4 py-2 sm:py-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Textarea container with fixed height on mobile */}
          <div className="relative w-full">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about any tech topic..."
              className="min-h-[50px] max-h-[100px] sm:max-h-[200px] pr-10 resize-none border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-primary rounded-lg w-full"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (message.trim()) {
                    handleSubmit(e);
                  }
                }
              }}
              rows={1}
            />
            
            {/* Clear/Hint Button */}
            {message.trim() ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 h-7 w-7"
                onClick={() => setMessage("")}
                aria-label="Clear message"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <div className="absolute right-2 top-2 text-gray-400">
                <HelpCircle className="h-4 w-4 opacity-50" />
              </div>
            )}
          </div>
          
          {/* Controls row */}
          <div className="flex justify-between items-center pb-2 sm:pb-0">
            <div className="flex items-center">
              {/* Voice input button */}
              {hasRecognitionSupport && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={`h-9 w-9 mr-2 rounded-full ${
                    isListening 
                      ? 'bg-red-100 text-red-500 border-red-300 dark:bg-red-900 dark:text-red-400 dark:border-red-700 animate-pulse' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                  onClick={toggleMicrophone}
                  aria-label={isListening ? "Stop dictation" : "Start dictation"}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              )}
              
              {/* Enter hint text - hidden on small screens */}
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> to send
              </span>
            </div>
            
            {/* Send button */}
            <Button
              type="submit"
              disabled={!message.trim()}
              className="rounded-full bg-primary hover:bg-primary/90 h-9 w-9"
              size="sm"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
