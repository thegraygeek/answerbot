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
  
  // Auto-resize the textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
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
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4 transition-colors">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about any tech topic in a straightforward way..."
              className="w-full min-h-[60px] max-h-[200px] pr-12 resize-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-primary"
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
            
            {message.trim() ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setMessage("")}
                aria-label="Clear message"
              >
                <X className="h-5 w-5" />
              </Button>
            ) : (
              <div className="absolute right-2 top-2 text-gray-400">
                <HelpCircle className="h-5 w-5 opacity-50" />
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline">
                Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> to send
              </p>
              
              {/* Voice input button */}
              {hasRecognitionSupport && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full ${
                    isListening 
                      ? 'bg-red-100 text-red-500 border-red-300 dark:bg-red-900 dark:text-red-400 dark:border-red-700 animate-pulse' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                  onClick={toggleMicrophone}
                  aria-label={isListening ? "Stop dictation" : "Start dictation"}
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              )}
            </div>
            
            <Button
              type="submit"
              disabled={!message.trim()}
              className="rounded-full bg-primary hover:bg-primary/90 h-8 w-8 sm:h-10 sm:w-10"
              size="icon"
              aria-label="Send message"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </form>
      </div>
    </footer>
  );
}
