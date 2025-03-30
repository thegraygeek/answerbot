import { KeyboardEvent, useRef, useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
}

export default function InputArea({ onSendMessage }: InputAreaProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to calculate actual content height
    textarea.style.height = 'auto';
    
    // Set height based on scrollHeight, but cap it at 200px
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  }, [message]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      <div className="max-w-4xl mx-auto relative flex">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="flex-1 resize-none border rounded-l-md p-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[50px] max-h-[200px] overflow-y-auto"
          rows={1}
        />
        <Button
          onClick={handleSend}
          className="rounded-l-none"
          disabled={!message.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Press Enter to send, Shift+Enter for a new line
      </div>
    </div>
  );
}