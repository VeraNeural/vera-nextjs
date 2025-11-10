'use client';

import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';
import BreathingOrb from '../orb/BreathingOrb';
import { useTtsHume } from '@/hooks/useTtsHume';
import { routeToTTSService, getHumeExpressiveness } from '@/lib/tts-router';

interface MessageBubbleProps {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isSaved?: boolean;
  imageData?: string; // base64 image data URL
  onSave?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function MessageBubble({
  id,
  content,
  role,
  timestamp,
  isSaved,
  imageData,
  onSave,
  onDelete,
}: MessageBubbleProps) {
  const isVera = role === 'assistant';
  const [theme, setTheme] = useState<string>('dark');
  const [isPlayingHume, setIsPlayingHume] = useState(false);
  const { speak: speakHume, isLoading: humeLoading, error: humeError } = useTtsHume();

  // Get TTS routing for this message
  const ttsRouting = isVera ? routeToTTSService(content, { preferredLatency: 'quality' }) : null;
  const humeExpressiveness = isVera ? getHumeExpressiveness(content) : null;

  const handlePlayWithHume = async () => {
    if (!isVera || !content) return;
    try {
      setIsPlayingHume(true);
      console.log('🎤 Hume AI TTS:', {
        contentType: ttsRouting?.contentType,
        expressiveness: humeExpressiveness,
      });

      await speakHume(content, {
        mode: (ttsRouting?.contentType as any) || 'default',
        ...humeExpressiveness,
        autoPlay: true,
      });
    } catch (err) {
      console.error('❌ Hume AI playback failed:', err);
    } finally {
      setIsPlayingHume(false);
    }
  };

  useEffect(() => {
    // Get initial theme
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(currentTheme);

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(newTheme);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // COMPLETELY SOLID backgrounds - NO TRANSPARENCY
  const getBackgroundColor = () => {
    if (isVera) {
      if (theme === 'light') return 'rgb(255, 255, 255)';
      if (theme === 'dark') return 'rgb(30, 30, 50)';
      return 'rgb(20, 20, 20)'; // deep
    } else {
      if (theme === 'light') return 'linear-gradient(135deg, rgb(200, 180, 230) 0%, rgb(180, 200, 240) 100%)';
      if (theme === 'dark') return 'linear-gradient(135deg, rgb(100, 80, 140) 0%, rgb(80, 120, 180) 100%)';
      return 'linear-gradient(135deg, rgb(80, 60, 100) 0%, rgb(60, 80, 120) 100%)'; // deep
    }
  };

  const getTextColor = () => {
    if (theme === 'light') return 'rgb(45, 45, 63)';
    return 'rgb(255, 255, 255)'; // FULLY OPAQUE TEXT
  };

  return (
    <div className={`flex gap-3 ${isVera ? 'flex-row' : 'flex-row-reverse'} animate-messageSlideIn`}>
      {/* Avatar */}
      {isVera ? (
        <BreathingOrb size={36} animate={true} showShimmer={true} />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orb-purple to-orb-blue flex items-center justify-center text-white font-bold">
          U
        </div>
      )}

      {/* Message Content */}
      <div className={`flex-1 max-w-[70%] ${isVera ? '' : 'flex flex-col items-end'}`}>
        <div
          className={`${isVera ? 'vera-message-solid' : 'user-message-solid'} user-select-text`}
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: getBackgroundColor(),
            backgroundColor: isVera 
              ? (theme === 'light' ? 'rgb(255, 255, 255)' : theme === 'dark' ? 'rgb(30, 30, 50)' : 'rgb(20, 20, 20)')
              : undefined,
            opacity: 1,
            boxShadow: theme === 'light' 
              ? '0 4px 20px rgba(0, 0, 0, 0.15)' 
              : '0 4px 20px rgba(0, 0, 0, 0.5)',
            border: isVera 
              ? '1px solid rgb(155, 137, 212)'
              : '1px solid rgb(155, 137, 212)',
            color: getTextColor(),
            userSelect: 'text',
          }}
        >
          {/* Image Preview */}
          {imageData && (
            <img
              src={imageData}
              alt="Uploaded image"
              style={{
                maxWidth: '300px',
                maxHeight: '300px',
                borderRadius: '12px',
                marginBottom: content ? '12px' : '0',
                objectFit: 'cover',
              }}
            />
          )}
          
          {/* Text Content */}
          {content && <p style={{ color: getTextColor() }} className="whitespace-pre-wrap">{content}</p>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-2 text-sm text-text-tertiary">
          <span>{formatDistanceToNow(new Date(timestamp), { addSuffix: true })}</span>
          
          {/* Hume AI Play Button (VERA messages only) */}
          {isVera && content && (
            <button
              onClick={handlePlayWithHume}
              disabled={humeLoading || isPlayingHume}
              className="hover:text-orb-purple transition-colors disabled:opacity-50"
              title={ttsRouting?.reason || 'Play VERA voice'}
            >
              {isPlayingHume || humeLoading ? '⏸' : '🎤'}
            </button>
          )}
          
          {onSave && (
            <button
              onClick={() => onSave(id)}
              className="hover:text-orb-purple transition-colors"
            >
              {isSaved ? '♥' : '♡'}
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(id)}
              className="hover:text-red-400 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}