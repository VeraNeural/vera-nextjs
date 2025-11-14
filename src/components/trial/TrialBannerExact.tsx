'use client';

import { useEffect, useState } from 'react';

interface TrialBannerExactProps {
  messagesUsed: number;
  totalMessages: number;
  hoursRemaining: number;
  onUpgrade: () => void;
}

export default function TrialBannerExact({ 
  messagesUsed, 
  totalMessages, 
  hoursRemaining,
  onUpgrade 
}: TrialBannerExactProps) {
  const [timeString, setTimeString] = useState('');
  
  const progressPercent = totalMessages > 0 ? (messagesUsed / totalMessages) * 100 : 0;
  const isCritical = hoursRemaining <= 12;
  const showMessages = totalMessages > 0;

  useEffect(() => {
    const updateTime = () => {
      if (hoursRemaining >= 24) {
        const days = Math.floor(hoursRemaining / 24);
        const hours = hoursRemaining % 24;
        setTimeString(`${days}d ${hours}h`);
      } else {
        setTimeString(`${hoursRemaining}h`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [hoursRemaining]);

  return (
    <div
      style={{
        position: 'relative',
        zIndex: 90,
        background: 'rgba(30, 30, 50, 0.3)',
        borderBottom: '1px solid rgba(100, 100, 120, 0.15)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexShrink: 0,
        boxShadow: 'none',
      }}
    >
      {/* Left: Trial Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <span
            style={{
              color: '#888',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.3px',
            }}
          >
            Trial
          </span>
          <span
            style={{
              background: 'rgba(100, 100, 120, 0.1)',
              color: '#888',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 500,
              border: '1px solid rgba(100, 100, 120, 0.15)',
            }}
          >
            {timeString} remaining
          </span>
        </div>
        
        {showMessages && (
          <>
            <p
              style={{
                color: '#888',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            >
              {messagesUsed} of {totalMessages} messages used
            </p>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '4px',
                background: 'rgba(100, 100, 120, 0.1)',
                borderRadius: '6px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'rgba(139, 92, 246, 0.3)',
                  borderRadius: '6px',
                  width: `${progressPercent}%`,
                  transition: 'width 0.3s ease',
                  boxShadow: 'none',
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Right: Upgrade Button */}
      <button
        onClick={async () => {
          try {
            const response = await fetch('/api/stripe/create-checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ plan: 'starter' }),
            });
            const data = await response.json();
            if (data.url) {
              window.location.href = data.url;
            }
          } catch (error) {
            console.error('Checkout error:', error);
          }
        }}
        style={{
          padding: '8px 16px',
          background: 'rgba(139, 92, 246, 0.2)',
          color: '#888',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: 'none',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)';
          e.currentTarget.style.color = '#aaa';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
          e.currentTarget.style.color = '#888';
        }}
      >
        Upgrade
      </button>
    </div>
  );
}
