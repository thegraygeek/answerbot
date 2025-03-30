import { useMemo, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User, Volume, VolumeX } from "lucide-react";
import { useVoiceContext } from "../../hooks/use-voice-context";
import { Button } from "../../components/ui/button";

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = useMemo(() => role === 'user', [role]);
  const { speak, isSpeechEnabled, hasSpeechSupport, isSpeaking } = useVoiceContext();
  
  // Auto-speak assistant messages if speech is enabled
  useEffect(() => {
    if (!isUser && isSpeechEnabled && content && hasSpeechSupport) {
      // Small delay to ensure the message is fully rendered
      const timer = setTimeout(() => {
        speak(content);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isUser, isSpeechEnabled, content, speak, hasSpeechSupport]);

  // Function to handle speaking the message on demand
  const handleSpeak = () => {
    if (hasSpeechSupport && content) {
      speak(content);
    }
  };
  
  // Get plain text content from markdown for speaking
  const plainTextContent = content.replace(/#+\s/g, '')
                                 .replace(/\*\*/g, '')
                                 .replace(/\*/g, '')
                                 .replace(/```[\s\S]*?```/g, 'code block');
  
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="h-9 w-9 rounded-full bg-primary/90 flex-shrink-0 flex items-center justify-center text-white">
          <Bot className="h-5 w-5" />
        </div>
      )}
      
      <div 
        className={`
          ${isUser ? 'order-1' : ''} 
          ${isUser 
            ? 'bg-primary text-white dark:bg-primary/90'
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100'
          } 
          rounded-lg px-4 py-3 max-w-[85%] md:max-w-[75%] shadow-sm relative
        `}
      >
        {isUser ? (
          <div className="text-sm whitespace-pre-wrap">
            {content}
          </div>
        ) : (
          <>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>
                {content}
              </ReactMarkdown>
            </div>
            
            {/* Text-to-speech button for assistant messages */}
            {hasSpeechSupport && !isUser && (
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full opacity-70 hover:opacity-100 bg-transparent text-gray-500 dark:text-gray-400"
                  onClick={handleSpeak}
                  aria-label="Read message aloud"
                >
                  {isSpeaking ? (
                    <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    <Volume className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      
      {isUser && (
        <div className="h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-300">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
