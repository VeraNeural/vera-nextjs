'use client';

import { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border-color bg-bg-secondary p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end gap-3">
          {/* Voice Input Button */}
          <button
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`p-3 rounded-full transition-colors ${
              isVoiceActive ? 'bg-orb-purple text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-bg-primary'
            }`}
          >
            🎤
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Share what's on your mind..."
              disabled={disabled}
              className="w-full px-4 py-3 bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-orb-purple min-h-[48px] max-h-[120px]"
              rows={1}
            />
            {message.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-text-tertiary">
                {message.length}
              </div>
            )}
          </div>

          {/* TTS Button */}
          <button
            onClick={() => setIsTTSActive(!isTTSActive)}
            className={`p-3 rounded-full transition-colors ${
              isTTSActive ? 'bg-orb-purple text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-bg-primary'
            }`}
          >
            🔊
          </button>

          {/* Attach Button */}
          <button className="p-3 rounded-full bg-bg-tertiary text-text-secondary hover:bg-bg-primary transition-colors">
            📎
          </button>

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            className="gradient-button p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↑
          </button>
        </div>

        {/* Disclaimer removed to keep input compact on mobile */}
      </div>
    </div>
  );
}