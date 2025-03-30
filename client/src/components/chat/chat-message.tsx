import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatMessage({ role, content }: ChatMessageProps) {
  // Convert line breaks to JSX
  const formattedContent = content.split('\n').map((line, i) => (
    <span key={i}>
      {line}
      {i < content.split('\n').length - 1 && <br />}
    </span>
  ));

  if (role === 'user') {
    return (
      <div className="flex items-start gap-3 ml-auto max-w-[80%] md:max-w-[70%]">
        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
          <p className="text-sm">{formattedContent}</p>
        </div>
        <div className="bg-primary/10 text-primary rounded-full p-2 mt-0.5">
          <User className="h-4 w-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 mr-auto max-w-[80%] md:max-w-[70%]">
      <div className="bg-accent text-accent-foreground rounded-full p-2 mt-0.5">
        <Bot className="h-4 w-4" />
      </div>
      <div className="bg-muted p-3 rounded-lg">
        <p className="text-sm whitespace-pre-line">{formattedContent}</p>
      </div>
    </div>
  );
}