import { Button } from "@/components/ui/button";
import { useVoiceContext } from "@/hooks/use-voice-context";
import { Mic, MicOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface VoiceInputProps {
  onTranscript: (text: string) => void;
}

export function VoiceInput({ onTranscript }: VoiceInputProps) {
  const {
    hasRecognitionSupport,
    isListeningEnabled,
    startListening,
    stopListening,
    isListening
  } = useVoiceContext();
  
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTimeout, setRecordingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Reset the recording state when listening state changes
  useEffect(() => {
    if (!isListening && isRecording) {
      setIsRecording(false);
      if (recordingTimeout) {
        clearTimeout(recordingTimeout);
        setRecordingTimeout(null);
      }
    }
  }, [isListening, isRecording, recordingTimeout]);

  // Handle speech recognition results
  useEffect(() => {
    if (isListeningEnabled && hasRecognitionSupport) {
      // Set up event listener for Web Speech API
      const handleSpeechResult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);
      };

      // Set up event listener for speech recognition end
      const handleSpeechEnd = () => {
        if (isRecording) {
          if (transcript.trim()) {
            onTranscript(transcript);
            setTranscript("");
          }
          setIsRecording(false);
        }
      };

      // Get SpeechRecognition object
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = handleSpeechResult;
        recognition.onend = handleSpeechEnd;
        
        return () => {
          recognition.onresult = null;
          recognition.onend = null;
        };
      }
    }
  }, [isListeningEnabled, hasRecognitionSupport, isRecording, transcript, onTranscript]);

  // Handle toggle recording
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      // Stop recording
      stopListening();
      setIsRecording(false);
      
      // Submit transcript if not empty
      if (transcript.trim()) {
        onTranscript(transcript);
        setTranscript("");
      }
      
      // Clear timeout if exists
      if (recordingTimeout) {
        clearTimeout(recordingTimeout);
        setRecordingTimeout(null);
      }
    } else {
      // Start recording
      setIsRecording(true);
      startListening();
      
      // Set a timeout to automatically stop recording after 10 seconds
      const timeout = setTimeout(() => {
        stopListening();
        setIsRecording(false);
        
        if (transcript.trim()) {
          onTranscript(transcript);
          setTranscript("");
        }
      }, 10000); // 10 seconds timeout
      
      setRecordingTimeout(timeout);
    }
  }, [isRecording, transcript, onTranscript, stopListening, startListening, recordingTimeout]);

  if (!hasRecognitionSupport) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={`rounded-full h-10 w-10 flex items-center justify-center ${
        isRecording 
          ? 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-500 border-red-400 animate-pulse' 
          : 'bg-gray-100 dark:bg-gray-800'
      }`}
      onClick={toggleRecording}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
      type="button"
    >
      {isRecording ? (
        <Mic className="h-5 w-5" />
      ) : (
        <MicOff className="h-5 w-5" />
      )}
    </Button>
  );
}