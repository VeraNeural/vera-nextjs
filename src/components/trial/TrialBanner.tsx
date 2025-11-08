'use client';

import { useState } from 'react';

interface TrialBannerProps {
  messagesRemaining: number;
  totalMessages: number;
  timeRemaining: string;
  onUpgrade: () => void;
}

export default function TrialBanner({
  messagesRemaining,
  totalMessages,
  timeRemaining,
  onUpgrade,
}: TrialBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const percentage = (messagesRemaining / totalMessages) * 100;

  if (!isVisible) return null;

  return (
    <div style={{ 
      background: 'rgba(30, 30, 50, 0.4)',
      borderBottom: '1px solid rgba(100, 100, 120, 0.15)',
      padding: '10px 24px',
    }}>
      <div style={{ 
        maxWidth: '100%',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        fontSize: '13px',
      }}>
        {/* Trial Info - Minimal */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1,
          color: '#888',
        }}>
          <span style={{ fontWeight: '500', color: '#aaa' }}>Trial</span>
          <span>•</span>
          <span>{messagesRemaining} of {totalMessages} messages</span>
          {timeRemaining && (
            <>
              <span>•</span>
              <span className="hidden md:inline">{timeRemaining}</span>
            </>
          )}
        </div>

        {/* Action Buttons - Soft */}
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <button
            onClick={onUpgrade}
            style={{
              padding: '8px 16px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '6px',
              color: '#aaa',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
              e.currentTarget.style.color = '#bbb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
              e.currentTarget.style.color = '#aaa';
            }}
          >
            Upgrade
          </button>
          
          <button
            onClick={() => setIsVisible(false)}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: 'none',
              color: '#666',
              cursor: 'pointer',
              fontSize: '16px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#888')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
            aria-label="Dismiss banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
