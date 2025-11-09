import React, { useState } from 'react';
import { useTtsHume } from '@/hooks/useTtsHume';
import { routeToTTSService, getHumeExpressiveness } from '@/lib/tts-router';

/**
 * Example component showing how to use dual TTS with intelligent routing
 * 
 * This demonstrates:
 * - Using Hume AI for therapeutic/emotional content
 * - Falling back to ElevenLabs for performance
 * - Detecting content type automatically
 * - Adjusting expressiveness based on user state
 */

interface VERAMessageProps {
  content: string;
  messageId: string;
  userState?: 'calm' | 'anxious' | 'overwhelmed' | 'excited';
}

export function VERAMessageWithTTS({ content, messageId, userState }: VERAMessageProps) {
  const [isPlayingHume, setIsPlayingHume] = useState(false);
  const [isPlayingElevenLabs, setIsPlayingElevenLabs] = useState(false);
  
  const { speak: speakHume, isLoading: humeLoading, error: humeError } = useTtsHume();

  // Determine routing
  const routing = routeToTTSService(content, {
    preferredLatency: 'quality',
  });

  // Get Hume expressiveness
  const expressiveness = getHumeExpressiveness(content);

  // Adjust expressiveness based on user state
  const adjustedExpressiveness = adjustForUserState(expressiveness, userState);

  const handlePlayWithHume = async () => {
    try {
      setIsPlayingHume(true);
      console.log('🎤 Playing with Hume AI:', {
        contentType: routing.contentType,
        reason: routing.reason,
        expressiveness: adjustedExpressiveness,
      });

      await speakHume(content, {
        mode: routing.contentType as 'therapeutic' | 'real-talk' | 'default',
        ...adjustedExpressiveness,
        autoPlay: true,
      });
    } catch (err) {
      console.error('❌ Hume AI playback failed:', err);
    } finally {
      setIsPlayingHume(false);
    }
  };

  const handlePlayWithElevenLabs = async () => {
    try {
      setIsPlayingElevenLabs(true);
      console.log('🎤 Playing with ElevenLabs:', {
        reason: 'Fallback or user preference',
      });

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) throw new Error('ElevenLabs request failed');

      const audioBlob = await response.blob();
      const audio = new Audio(URL.createObjectURL(audioBlob));
      audio.play();
    } catch (err) {
      console.error('❌ ElevenLabs playback failed:', err);
    } finally {
      setIsPlayingElevenLabs(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Message content */}
      <div className="bg-slate-900 rounded-lg p-4 text-slate-100">
        {content}
      </div>

      {/* TTS controls */}
      <div className="flex gap-2 items-center">
        {/* Primary service button */}
        <button
          onClick={
            routing.primary === 'hume' ? handlePlayWithHume : handlePlayWithElevenLabs
          }
          disabled={
            routing.primary === 'hume' ? humeLoading : isPlayingElevenLabs
          }
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded text-sm font-medium transition"
          title={routing.reason}
        >
          <span className="text-lg">
            {routing.primary === 'hume' ? '🎤' : '🔊'}
          </span>
          {routing.primary === 'hume' ? 'VERA Voice' : 'Read'}
          {routing.primary === 'hume' && humeLoading && '...'}
          {routing.primary === 'elevenlabs' && isPlayingElevenLabs && '...'}
        </button>

        {/* Fallback service button (if available) */}
        {routing.fallback && (
          <button
            onClick={
              routing.fallback === 'hume'
                ? handlePlayWithHume
                : handlePlayWithElevenLabs
            }
            disabled={
              routing.fallback === 'hume' ? humeLoading : isPlayingElevenLabs
            }
            className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-500 text-slate-100 rounded text-sm transition"
            title={`Fallback: Use ${routing.fallback}`}
          >
            {routing.fallback === 'hume' ? '🎤' : '🔊'} Alt
            {routing.fallback === 'hume' && humeLoading && '...'}
            {routing.fallback === 'elevenlabs' && isPlayingElevenLabs && '...'}
          </button>
        )}

        {/* Content type badge */}
        <span className="text-xs px-2 py-1 bg-slate-800 text-slate-300 rounded">
          {routing.contentType}
        </span>
      </div>

      {/* Error messages */}
      {humeError && (
        <div className="text-xs text-red-400 bg-red-950 p-2 rounded">
          {humeError}
        </div>
      )}

      {/* Expressiveness info (optional, for debugging) */}
      <details className="text-xs text-slate-500 group">
        <summary className="cursor-pointer hover:text-slate-400">
          📊 {routing.contentType} settings
        </summary>
        <pre className="mt-2 p-2 bg-slate-900 rounded text-slate-300 overflow-x-auto">
          {JSON.stringify(
            {
              routing: {
                primary: routing.primary,
                fallback: routing.fallback,
                reason: routing.reason,
              },
              expressiveness: adjustedExpressiveness,
              userState,
            },
            null,
            2
          )}
        </pre>
      </details>
    </div>
  );
}

/**
 * Adjust expressiveness based on user's nervous system state
 */
function adjustForUserState(
  base: ReturnType<typeof getHumeExpressiveness>,
  userState?: string
): typeof base {
  if (!userState) return base;

  switch (userState) {
    case 'anxious':
      return {
        nervousness: Math.max(0, base.nervousness - 10),  // VERA stays calmer
        confidence: Math.min(100, base.confidence + 10),  // More assured
        sentiment: Math.min(100, base.sentiment + 15),    // Warmer
        urgency: Math.max(0, base.urgency - 10),          // Slower
      };

    case 'overwhelmed':
      return {
        nervousness: Math.max(0, base.nervousness - 15),
        confidence: Math.min(100, base.confidence + 15),
        sentiment: Math.min(100, base.sentiment + 20),
        urgency: Math.max(0, base.urgency - 20),
      };

    case 'excited':
      return {
        nervousness: Math.min(100, base.nervousness + 15),
        confidence: Math.min(100, base.confidence + 10),
        sentiment: Math.min(100, base.sentiment + 25),
        urgency: Math.min(100, base.urgency + 30),
      };

    case 'calm':
      return base; // No adjustment needed

    default:
      return base;
  }
}
