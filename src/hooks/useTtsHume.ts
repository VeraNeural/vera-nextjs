import { useCallback, useState } from 'react';

interface HumeAIOptions {
  mode?: 'therapeutic' | 'real-talk' | 'default';
  nervousness?: number;
  confidence?: number;
  sentiment?: number;
  urgency?: number;
  autoPlay?: boolean;
}

interface UseTtsHumeResult {
  isLoading: boolean;
  error: string | null;
  speak: (text: string, options?: HumeAIOptions) => Promise<void>;
  stop: () => void;
  currentText: string | null;
}

/**
 * Hook for Hume AI expressive text-to-speech
 * 
 * Usage:
 * const { speak, isLoading, error } = useTtsHume();
 * 
 * await speak("I'm here to help you through this", {
 *   mode: 'therapeutic',
 *   nervousness: 10,
 * });
 */
export function useTtsHume(): UseTtsHumeResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (text: string, options?: HumeAIOptions) => {
      try {
        setIsLoading(true);
        setError(null);
        setCurrentText(text);

        console.log('🎤 Requesting Hume AI speech:', {
          textLength: text.length,
          mode: options?.mode || 'default',
        });

        const response = await fetch('/api/tts-hume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            mode: options?.mode || 'default',
            expressiveness: {
              nervousness: options?.nervousness,
              confidence: options?.confidence,
              sentiment: options?.sentiment,
              urgency: options?.urgency,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate speech');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        console.log('✅ Hume AI audio received:', {
          size: audioBlob.size,
          type: audioBlob.type,
        });

        // Create or reuse audio element
        let audio = audioElement;
        if (!audio) {
          audio = new Audio();
          setAudioElement(audio);
        }

        audio.src = audioUrl;

        if (options?.autoPlay !== false) {
          await audio.play();
          console.log('▶️ Playing Hume AI audio');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('❌ Hume AI TTS error:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [audioElement]
  );

  const stop = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      console.log('⏹️ Stopped Hume AI audio');
    }
  }, [audioElement]);

  return {
    isLoading,
    error,
    speak,
    stop,
    currentText,
  };
}
