'use client';

import { useState, useRef, useEffect } from 'react';
import ImagePreview from './ImagePreview';

interface MessageInputProps {
  onSend: (content: string, imageFile?: File, imageContext?: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageContext, setImageContext] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if ((message.trim() || selectedImage) && !disabled && !isAnalyzing) {
      onSend(message.trim(), selectedImage || undefined, imageContext);
      setMessage('');
      setSelectedImage(null);
      setImageContext('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImageContext('');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImageContext('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        {/* Image Preview Section */}
        {selectedImage && (
          <div className="mb-4">
            <ImagePreview 
              file={selectedImage} 
              onRemove={handleRemoveImage}
              isAnalyzing={isAnalyzing}
            />
            {selectedImage && (
              <textarea
                value={imageContext}
                onChange={(e) => setImageContext(e.target.value)}
                placeholder="Add context or questions about this image (optional)..."
                className="w-full mt-3 px-4 py-2 bg-bg-tertiary text-text-primary placeholder-text-tertiary rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orb-purple min-h-[48px] max-h-[80px] text-sm"
                rows={2}
              />
            )}
          </div>
        )}

        <div className="flex items-end gap-3">
          {/* Voice Input Button */}
          <button
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`p-3 rounded-full transition-colors ${
              isVoiceActive ? 'bg-orb-purple text-white' : 'bg-bg-tertiary text-text-secondary hover:bg-bg-primary'
            }`}
            disabled={disabled || isAnalyzing}
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
              placeholder={selectedImage ? "Add your message..." : "Share what's on your mind..."}
              disabled={disabled || isAnalyzing}
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
            disabled={disabled || isAnalyzing}
          >
            🔊
          </button>

          {/* Attach Button */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-full bg-bg-tertiary text-text-secondary hover:bg-bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={disabled || isAnalyzing}
            title="Attach image"
          >
            📎
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageSelect}
            className="hidden"
            aria-label="Select image"
          />

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={(!message.trim() && !selectedImage) || disabled || isAnalyzing}
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