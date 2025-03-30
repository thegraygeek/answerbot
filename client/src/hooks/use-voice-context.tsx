import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useSpeechSynthesis, useSpeechToText } from '@/hooks/use-speech';

// Voice Context Interface
interface VoiceContextType {
  // Text-to-speech controls
  isSpeechEnabled: boolean;
  toggleSpeech: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
  hasSpeechSupport: boolean;
  
  // Speech recognition controls
  isListeningEnabled: boolean;
  toggleListening: () => void;
  startListening: () => void;
  stopListening: () => void;
  isListening: boolean;
  hasRecognitionSupport: boolean;
  
  // Voice settings
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  speechPitch: number;
  setSpeechPitch: (pitch: number) => void;
  speechVolume: number;
  setSpeechVolume: (volume: number) => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
}

// Create context with default values
const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

// Provider component
interface VoiceProviderProps {
  children: ReactNode;
}

export function VoiceProvider({ children }: VoiceProviderProps) {
  // User preferences state
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const [isListeningEnabled, setIsListeningEnabled] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Initialize speech hooks
  const { 
    speak: synthesisSpeak,
    stop: stopSpeaking,
    isSpeaking,
    hasSynthesisSupport: hasSpeechSupport,
    voices: availableVoices,
  } = useSpeechSynthesis({
    rate: speechRate,
    pitch: speechPitch,
    volume: speechVolume,
    voice: selectedVoice || undefined,
  });

  const {
    startListening: startSpeechRecognition,
    stopListening: stopSpeechRecognition,
    isListening,
    hasRecognitionSupport,
    transcript,
  } = useSpeechToText({
    continuous: true,
  });

  // Load saved preferences from localStorage
  useEffect(() => {
    // Speech settings
    const savedSpeechEnabled = localStorage.getItem('isSpeechEnabled');
    if (savedSpeechEnabled) {
      setIsSpeechEnabled(savedSpeechEnabled === 'true');
    }

    // Voice input settings
    const savedListeningEnabled = localStorage.getItem('isListeningEnabled');
    if (savedListeningEnabled) {
      setIsListeningEnabled(savedListeningEnabled === 'true');
    }

    // Voice properties
    const savedRate = localStorage.getItem('speechRate');
    if (savedRate) {
      setSpeechRate(parseFloat(savedRate));
    }

    const savedPitch = localStorage.getItem('speechPitch');
    if (savedPitch) {
      setSpeechPitch(parseFloat(savedPitch));
    }

    const savedVolume = localStorage.getItem('speechVolume');
    if (savedVolume) {
      setSpeechVolume(parseFloat(savedVolume));
    }

    const savedVoiceURI = localStorage.getItem('selectedVoiceURI');
    if (savedVoiceURI && availableVoices.length > 0) {
      const voice = availableVoices.find(v => v.voiceURI === savedVoiceURI);
      if (voice) {
        setSelectedVoice(voice);
      }
    }
  }, [availableVoices]);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('isSpeechEnabled', isSpeechEnabled.toString());
  }, [isSpeechEnabled]);

  useEffect(() => {
    localStorage.setItem('isListeningEnabled', isListeningEnabled.toString());
  }, [isListeningEnabled]);

  useEffect(() => {
    localStorage.setItem('speechRate', speechRate.toString());
  }, [speechRate]);

  useEffect(() => {
    localStorage.setItem('speechPitch', speechPitch.toString());
  }, [speechPitch]);

  useEffect(() => {
    localStorage.setItem('speechVolume', speechVolume.toString());
  }, [speechVolume]);

  useEffect(() => {
    if (selectedVoice) {
      localStorage.setItem('selectedVoiceURI', selectedVoice.voiceURI);
    }
  }, [selectedVoice]);

  // Set default voice when voices are loaded
  useEffect(() => {
    if (availableVoices.length > 0 && !selectedVoice) {
      // Try to find an English voice
      const englishVoice = availableVoices.find(v => v.lang.includes('en-US'));
      if (englishVoice) {
        setSelectedVoice(englishVoice);
      } else {
        // If no English voice, use the first one
        setSelectedVoice(availableVoices[0]);
      }
    }
  }, [availableVoices, selectedVoice]);

  // Toggle speech on/off
  const toggleSpeech = useCallback(() => {
    setIsSpeechEnabled(prev => !prev);
  }, []);

  // Toggle listening on/off
  const toggleListening = useCallback(() => {
    const newValue = !isListeningEnabled;
    setIsListeningEnabled(newValue);
    
    if (newValue && hasRecognitionSupport) {
      startSpeechRecognition();
    } else if (!newValue && hasRecognitionSupport) {
      stopSpeechRecognition();
    }
  }, [isListeningEnabled, hasRecognitionSupport, startSpeechRecognition, stopSpeechRecognition]);

  // Start listening if enabled
  useEffect(() => {
    if (isListeningEnabled && hasRecognitionSupport && !isListening) {
      startSpeechRecognition();
    }
  }, [isListeningEnabled, hasRecognitionSupport, isListening, startSpeechRecognition]);

  // Speak text if speech is enabled
  const speak = useCallback((text: string) => {
    if (isSpeechEnabled && hasSpeechSupport) {
      synthesisSpeak(text);
    }
  }, [isSpeechEnabled, hasSpeechSupport, synthesisSpeak]);

  // Provide the context value
  const contextValue: VoiceContextType = {
    isSpeechEnabled,
    toggleSpeech,
    speak,
    stopSpeaking,
    isSpeaking,
    hasSpeechSupport,
    
    isListeningEnabled,
    toggleListening,
    startListening: startSpeechRecognition,
    stopListening: stopSpeechRecognition,
    isListening,
    hasRecognitionSupport,
    
    speechRate,
    setSpeechRate,
    speechPitch,
    setSpeechPitch,
    speechVolume,
    setSpeechVolume,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
}

// Custom hook to use the voice context
export function useVoiceContext() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error('useVoiceContext must be used within a VoiceProvider');
  }
  return context;
}