import { Button } from "../../components/ui/button";
import { useVoiceContext } from "../../hooks/use-voice-context";
import { Mic, MicOff, Volume2, VolumeX, Headphones } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../../components/ui/dropdown-menu";
import { Slider } from "../../components/ui/slider";
import { useState } from "react";

export function VoiceToggle() {
  const { 
    isSpeechEnabled, 
    toggleSpeech,
    isListeningEnabled,
    toggleListening,
    hasSpeechSupport,
    hasRecognitionSupport,
    speechRate,
    setSpeechRate,
    speechVolume,
    setSpeechVolume,
    speechPitch,
    setSpeechPitch,
    selectedVoice,
    setSelectedVoice,
    availableVoices
  } = useVoiceContext();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Get English voices
  const englishVoices = availableVoices.filter((voice: SpeechSynthesisVoice) => 
    voice.lang.includes('en-')
  );

  return (
    <div className="flex items-center space-x-3 sm:space-x-4">
      {/* Voice input toggle button */}
      {hasRecognitionSupport ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`p-2 sm:p-3 rounded-full shadow-sm h-10 w-10 sm:h-12 sm:w-12 ${
                  isListeningEnabled ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700'
                }`}
                onClick={toggleListening}
                disabled={!hasRecognitionSupport}
                aria-label={isListeningEnabled ? "Disable voice input" : "Enable voice input"}
              >
                {isListeningEnabled ? (
                  <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isListeningEnabled ? "Disable voice input" : "Enable voice input"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}

      {/* Text-to-speech toggle button */}
      {hasSpeechSupport ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className={`p-2 sm:p-3 rounded-full shadow-sm h-10 w-10 sm:h-12 sm:w-12 ${
                  isSpeechEnabled ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700'
                }`}
                onClick={toggleSpeech}
                disabled={!hasSpeechSupport}
                aria-label={isSpeechEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
              >
                {isSpeechEnabled ? (
                  <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isSpeechEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}

      {/* Speech settings dropdown */}
      {hasSpeechSupport ? (
        <DropdownMenu
          open={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="p-2 sm:p-3 rounded-full shadow-sm bg-gray-100 dark:bg-gray-700 h-10 w-10 sm:h-12 sm:w-12"
                    aria-label="Voice settings"
                  >
                    <Headphones className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                Voice settings
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <DropdownMenuContent className="w-56 sm:w-64 max-w-[calc(100vw-20px)]">
            <DropdownMenuLabel>Voice Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Voice selection */}
            <div className="px-2 py-1.5">
              <label className="text-xs font-medium mb-1.5 block">Voice</label>
              <select 
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                value={selectedVoice?.voiceURI || ""}
                onChange={(e) => {
                  const selectedVoiceURI = e.target.value;
                  const voice = availableVoices.find((v: SpeechSynthesisVoice) => v.voiceURI === selectedVoiceURI);
                  if (voice) {
                    setSelectedVoice(voice);
                  }
                }}
              >
                {englishVoices.length > 0 ? (
                  englishVoices.map((voice: SpeechSynthesisVoice) => (
                    <option key={voice.voiceURI} value={voice.voiceURI}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))
                ) : (
                  <option value="">Default Voice</option>
                )}
              </select>
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Rate slider */}
            <div className="px-2 py-1.5">
              <label className="text-xs font-medium mb-1.5 block">
                Rate: {speechRate.toFixed(1)}x
              </label>
              <Slider
                value={[speechRate]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={(values) => setSpeechRate(values[0])}
              />
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Pitch slider */}
            <div className="px-2 py-1.5">
              <label className="text-xs font-medium mb-1.5 block">
                Pitch: {speechPitch.toFixed(1)}
              </label>
              <Slider
                value={[speechPitch]}
                min={0.5}
                max={2}
                step={0.1}
                onValueChange={(values) => setSpeechPitch(values[0])}
              />
            </div>
            
            <DropdownMenuSeparator />
            
            {/* Volume slider */}
            <div className="px-2 py-1.5">
              <label className="text-xs font-medium mb-1.5 block">
                Volume: {Math.round(speechVolume * 100)}%
              </label>
              <Slider
                value={[speechVolume]}
                min={0}
                max={1}
                step={0.1}
                onValueChange={(values) => setSpeechVolume(values[0])}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}