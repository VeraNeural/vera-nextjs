'use client';

import { useState, useRef, KeyboardEvent, useEffect } from 'react';

interface InputContainerProps {
  onSend: (message: string, imageData?: { base64: string; mimeType: string; name: string }) => void;
  disabled?: boolean;
  placeholder?: string;
  lastMessage?: string; // For TTS
}

export default function InputContainer({ 
  onSend, 
  disabled = false,
  placeholder = "Share what's on your mind...",
  lastMessage
}: InputContainerProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false); // Auto-play TTS toggle
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastPlayedMessageRef = useRef<string>(''); // Track last played message

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setMessage((prev) => prev + finalTranscript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Auto-play TTS when enabled and lastMessage changes
  useEffect(() => {
    if (ttsEnabled && lastMessage && lastMessage !== lastPlayedMessageRef.current) {
      lastPlayedMessageRef.current = lastMessage;
      handleTTS();
    }
  }, [lastMessage, ttsEnabled]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Failed to start recording:', error);
      }
    }
  };

  const handleTTS = async () => {
    if (!lastMessage) {
      return;
    }

    // If already playing, stop
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    try {
      setAudioLoading(true);

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: lastMessage }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          try { alert('Your trial has ended. Please upgrade to use speech.'); } catch {}
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('vera:subscription_required'));
          }
        }
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Stop any existing audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('TTS error:', error);
      alert('Failed to generate speech. Please try again.');
    } finally {
      setAudioLoading(false);
    }
  };

  const handleSend = async () => {
    if (disabled) return;

    const finalMessage = message.trim();

    // Support sending image-only (no text)
    if (attachedFile && imagePreview) {
      const base64 = imagePreview.split(',')[1]; // Remove data:image/...;base64, prefix
      const imageData = {
        base64,
        mimeType: attachedFile.type,
        name: attachedFile.name
      };

      onSend(finalMessage, imageData);
      setAttachedFile(null);
      setImagePreview(null);
      setMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
      return;
    }

    // Text-only send
    if (finalMessage) {
      onSend(finalMessage);
      setMessage('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        return;
      }
      
      // Check file type (images only for now)
      if (!file.type.startsWith('image/')) {
        alert('Only image files are supported.');
        return;
      }
      
      // Convert to base64 for preview and sending
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAttachedFile(file);
      };
      reader.readAsDataURL(file);
    }
    
    // Reset input so same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setImagePreview(null);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  return (
    <div
      className="input-container"
      style={{
        position: 'relative',
        zIndex: 80,
        flexShrink: 0,
        background: 'var(--container-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-color)',
        padding: '16px 20px',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
      }}
    >
      {/* Image Preview */}
      {imagePreview && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto 12px',
            position: 'relative',
            display: 'inline-block',
          }}
        >
          <img
            src={imagePreview}
            alt="Preview"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              borderRadius: '12px',
              border: '2px solid var(--orb-1)',
              objectFit: 'cover',
            }}
          />
          <button
            onClick={removeAttachment}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.7)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
            title="Remove image"
          >
            ×
          </button>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Attach Button */}
        <button
          onClick={handleAttachClick}
          disabled={disabled}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: attachedFile ? 'var(--orb-purple)' : 'var(--input-bg)',
            border: attachedFile ? '1px solid var(--orb-1)' : '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            color: attachedFile ? '#fff' : 'var(--text-secondary)',
            flexShrink: 0,
            opacity: disabled ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && !attachedFile) {
              e.currentTarget.style.background = 'var(--quick-button-hover)';
              e.currentTarget.style.borderColor = 'var(--orb-1)';
              e.currentTarget.style.color = 'var(--orb-1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!attachedFile) {
              e.currentTarget.style.background = 'var(--input-bg)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
          title={attachedFile ? `Attached: ${attachedFile.name}` : "Attach image"}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path
              d="M10 18a6 6 0 006-6V6a4 4 0 00-8 0v6a2 2 0 004 0V7"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Textarea Container */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            minWidth: 0,
          }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            placeholder={placeholder}
            rows={1}
            style={{
              width: '100%',
              minHeight: '44px',
              maxHeight: '150px',
              padding: '12px 16px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontSize: '15px',
              lineHeight: '1.5',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              cursor: disabled ? 'not-allowed' : 'text',
              opacity: disabled ? 0.5 : 1,
            }}
            onFocus={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = 'var(--orb-1)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(155, 137, 212, 0.1)';
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Voice Button */}
        <button
          onClick={handleVoiceInput}
          disabled={disabled}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: isRecording 
              ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
              : 'var(--input-bg)',
            border: `1px solid ${isRecording ? '#ef4444' : 'var(--border-color)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            color: isRecording ? '#fff' : 'var(--text-secondary)',
            flexShrink: 0,
            opacity: disabled ? 0.5 : 1,
            animation: isRecording ? 'recordingPulse 1.5s infinite' : 'none',
          }}
          onMouseEnter={(e) => {
            if (!disabled && !isRecording) {
              e.currentTarget.style.background = 'var(--quick-button-hover)';
              e.currentTarget.style.borderColor = 'var(--orb-1)';
              e.currentTarget.style.color = 'var(--orb-1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isRecording) {
              e.currentTarget.style.background = 'var(--input-bg)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
          title={isRecording ? "Stop recording" : "Voice input"}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <path
              d="M10 1a3 3 0 00-3 3v6a3 3 0 006 0V4a3 3 0 00-3-3z"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 10a6 6 0 01-12 0M10 16v3"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* TTS Button */}
        <button
          onClick={() => setTtsEnabled(!ttsEnabled)}
          disabled={disabled}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: ttsEnabled 
              ? 'linear-gradient(135deg, var(--orb-1) 0%, var(--orb-3) 100%)'
              : 'var(--input-bg)',
            border: `1px solid ${ttsEnabled ? 'var(--orb-1)' : 'var(--border-color)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            color: ttsEnabled ? '#fff' : 'var(--text-secondary)',
            flexShrink: 0,
            opacity: disabled ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!disabled && !ttsEnabled) {
              e.currentTarget.style.background = 'var(--quick-button-hover)';
              e.currentTarget.style.borderColor = 'var(--orb-1)';
              e.currentTarget.style.color = 'var(--orb-1)';
            }
          }}
          onMouseLeave={(e) => {
            if (!ttsEnabled) {
              e.currentTarget.style.background = 'var(--input-bg)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
          title={ttsEnabled ? "TTS Auto-play ON (click to turn off)" : "TTS Auto-play OFF (click to turn on)"}
        >
          {audioLoading || isPlaying ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path
                d="M9 4L4 8H1v4h3l5 4V4z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.54 7.46a5 5 0 010 7.07M17.07 5.93a8 8 0 010 11.31"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={isPlaying ? "1" : "0.5"}
                style={{ animation: isPlaying ? 'pulse 1.5s ease-in-out infinite' : 'none' }}
              />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path
                d="M9 4L4 8H1v4h3l5 4V4zM15.54 7.46a5 5 0 010 7.07"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: message.trim() && !disabled
              ? 'linear-gradient(135deg, var(--orb-1) 0%, var(--orb-3) 100%)'
              : 'var(--input-bg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            color: message.trim() && !disabled ? '#fff' : 'var(--text-soft)',
            flexShrink: 0,
            opacity: disabled || !message.trim() ? 0.5 : 1,
            boxShadow: message.trim() && !disabled ? '0 4px 15px rgba(155, 137, 212, 0.3)' : 'none',
            animation: message.trim() && !disabled ? 'sendButtonPulse 2s infinite' : 'none',
          }}
          onMouseEnter={(e) => {
            if (!disabled && message.trim()) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(155, 137, 212, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            if (message.trim() && !disabled) {
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(155, 137, 212, 0.3)';
            }
          }}
          title="Send message"
        >
          {(disabled && message.trim()) ? (
            <span
              aria-hidden
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: '2px solid var(--border-color)',
                borderTopColor: 'var(--orb-1)',
                display: 'inline-block',
                animation: 'spin 0.9s linear infinite',
              }}
            />
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path
                d="M18 2L9 11M18 2l-6 16-3-7-7-3 16-6z"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Disclaimer removed to avoid mobile layout shift */}

      {/* Animations */}
      <style jsx>{`
        @keyframes recordingPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
