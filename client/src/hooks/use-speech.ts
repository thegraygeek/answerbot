import { useState, useEffect, useCallback, useRef } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

// Interfaces for speech capabilities
interface UseSpeechToTextProps {
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  language?: string;
  continuous?: boolean;
}

interface UseSpeechSynthesisProps {
  onEnd?: () => void;
  voice?: SpeechSynthesisVoice;
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseSpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  hasRecognitionSupport: boolean;
  error: string | null;
}

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  cancel: () => void;
  isPaused: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  pause: () => void;
  resume: () => void;
  hasSynthesisSupport: boolean;
}

// Speech recognition hook
export function useSpeechToText({
  onResult = () => {},
  onEnd = () => {},
  language = 'en-US',
  continuous = true,
}: UseSpeechToTextProps = {}): UseSpeechToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [hasRecognitionSupport, setHasRecognitionSupport] = useState(false);

  // Initialize speech recognition when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - TypeScript doesn't know about webkitSpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setHasRecognitionSupport(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = continuous;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = language;
      } else {
        setHasRecognitionSupport(false);
        setError('Speech recognition not supported in this browser');
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        if (isListening) {
          recognitionRef.current.stop();
        }
      }
    };
  }, [language, continuous]);

  // Set up event handlers when isListening changes
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const fullTranscript = event.results[current][0].transcript;
        setTranscript(fullTranscript);
        onResult(fullTranscript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        onEnd();
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error);
        setIsListening(false);
      };

      try {
        recognitionRef.current.start();
      } catch (err) {
        // Handle cases where recognition is already started
        console.error('Speech recognition error:', err);
      }
    } else if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // Handle cases where recognition is already stopped
        console.error('Error stopping speech recognition:', err);
      }
    }
  }, [isListening, onResult, onEnd]);

  const startListening = useCallback(() => {
    setError(null);
    setTranscript('');
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasRecognitionSupport,
    error,
  };
}

// Text-to-speech synthesis hook
export function useSpeechSynthesis({
  onEnd = () => {},
  voice,
  rate = 1,
  pitch = 1,
  volume = 1,
}: UseSpeechSynthesisProps = {}): UseSpeechSynthesisReturn {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasSynthesisSupport, setHasSynthesisSupport] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize and load available voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setHasSynthesisSupport(true);
      
      // Load available voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
      
      // Clean up on unmount
      return () => {
        cancel();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      setHasSynthesisSupport(false);
    }
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!hasSynthesisSupport) return;
      
      // Cancel any current speech
      cancel();
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      // Set pronunciation options
      utterance.voice = voice || (voices.find(v => v.lang.includes('en-US')) || null);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      
      // Set event handlers
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd();
      };
      utterance.onpause = () => setIsPaused(true);
      utterance.onresume = () => setIsPaused(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
      };
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
    },
    [hasSynthesisSupport, voice, voices, rate, pitch, volume, onEnd]
  );

  const stop = useCallback(() => {
    if (!hasSynthesisSupport) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [hasSynthesisSupport]);

  const cancel = useCallback(() => {
    if (!hasSynthesisSupport) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [hasSynthesisSupport]);

  const pause = useCallback(() => {
    if (!hasSynthesisSupport || !isSpeaking) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [hasSynthesisSupport, isSpeaking]);

  const resume = useCallback(() => {
    if (!hasSynthesisSupport || !isPaused) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [hasSynthesisSupport, isPaused]);

  return {
    speak,
    stop,
    cancel,
    pause,
    resume,
    isPaused,
    isSpeaking,
    voices,
    hasSynthesisSupport,
  };
}

// Additional types for TypeScript compatibility
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}