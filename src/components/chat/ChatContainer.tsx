'use client';

import { useEffect, useRef } from 'react';
import BreathingOrb from '../orb/BreathingOrb';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isSaved?: boolean;
  imageData?: string; // base64 image data URL
}

interface ChatContainerProps {
  messages: Message[];
  isTyping?: boolean;
  onSaveMessage?: (id: string) => void;
  onDeleteMessage?: (id: string) => void;
}

export default function ChatContainer({ 
  messages, 
  isTyping = false,
  onSaveMessage,
  onDeleteMessage
}: ChatContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {messages.map((message) => (
        <div
          key={message.id}
          style={{
            animation: 'messageAppear 0.5s ease-out',
            display: 'flex',
            flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              flexShrink: 0,
              marginTop: '4px',
            }}
          >
            {message.role === 'assistant' ? (
              <div
                style={{
                  animation: 'avatarPulse 3s ease-in-out infinite',
                }}
              >
                <BreathingOrb size={42} animate={true} showShimmer={true} />
              </div>
            ) : (
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--orb-3), var(--orb-1))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(100, 181, 246, 0.3)',
                }}
              >
                U
              </div>
            )}
          </div>

          {/* Message Content */}
          <div
            style={{
              flex: 1,
              maxWidth: '85%',
              minWidth: 0,
            }}
          >
            {/* Message Bubble */}
            <div
              style={{
                padding: '16px 20px',
                borderRadius: message.role === 'assistant' ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                background: message.role === 'assistant' 
                  ? 'var(--message-bg)' 
                  : 'var(--user-message-bg)',
                border: `1px solid ${message.role === 'assistant' ? 'rgba(155, 137, 212, 0.2)' : 'rgba(100, 181, 246, 0.2)'}`,
                boxShadow: message.role === 'assistant'
                  ? '0 4px 16px rgba(155, 137, 212, 0.1)'
                  : '0 4px 16px rgba(100, 181, 246, 0.1)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Shimmer effect on VERA messages */}
              {message.role === 'assistant' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
                    animation: 'buttonShimmer 3s infinite',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Image Display */}
              {message.imageData && (
                <img
                  src={message.imageData}
                  alt="Shared image"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '12px',
                    marginBottom: message.content ? '12px' : '0',
                    objectFit: 'cover',
                  }}
                />
              )}

              {/* Text Content */}
              {message.content && (
                <p
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    margin: 0,
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {message.content}
                </p>
              )}
            </div>

            {/* Message Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginTop: '8px',
                paddingLeft: message.role === 'user' ? '0' : '8px',
                paddingRight: message.role === 'assistant' ? '0' : '8px',
              }}
            >
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--text-soft)',
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              {message.role === 'assistant' && (
                <>
                  <button
                    onClick={() => onSaveMessage?.(message.id)}
                    title="Save message"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: message.isSaved ? '#F44336' : 'var(--text-soft)',
                      cursor: 'pointer',
                      padding: '4px',
                      fontSize: '14px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#F44336';
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = message.isSaved ? '#F44336' : 'var(--text-soft)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {message.isSaved ? '❤️' : '♡'}
                  </button>

                  <button
                    onClick={() => onDeleteMessage?.(message.id)}
                    title="Delete message"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-soft)',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      fontSize: '12px',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#F44336';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-soft)';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor">
                      <path d="M1 3.5h12M11.5 3.5v9a1 1 0 01-1 1h-7a1 1 0 01-1-1v-9M4.5 3.5v-2a1 1 0 011-1h3a1 1 0 011 1v2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
      {isTyping && (
        <div
          style={{
            animation: 'messageAppear 0.3s ease-out',
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flexShrink: 0, marginTop: '4px' }}>
            <BreathingOrb size={42} animate={true} showShimmer={true} />
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderRadius: '20px 20px 20px 4px',
              background: 'var(--message-bg)',
              border: '1px solid rgba(155, 137, 212, 0.2)',
              boxShadow: '0 4px 16px rgba(155, 137, 212, 0.1)',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--orb-1)',
                  animation: 'typingBounce 1.4s infinite',
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
