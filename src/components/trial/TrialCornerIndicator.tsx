'use client';

import { useEffect, useState } from 'react';

interface TrialCornerIndicatorProps {
  messagesUsed?: number;
  totalMessages?: number;
  hoursRemaining: number;
  onUpgrade: () => void;
}

export default function TrialCornerIndicator({ 
  messagesUsed, 
  totalMessages, 
  hoursRemaining,
  onUpgrade 
}: TrialCornerIndicatorProps) {
  const [timeString, setTimeString] = useState('');
  const [expanded, setExpanded] = useState(false);
  
  const hasMessageLimits = typeof messagesUsed === 'number' && typeof totalMessages === 'number' && totalMessages > 0;
  const progressPercent = hasMessageLimits ? (messagesUsed! / totalMessages!) * 100 : 0;
  const isCritical = hoursRemaining <= 12;

  useEffect(() => {
    const updateTime = () => {
      if (hoursRemaining >= 24) {
        const days = Math.floor(hoursRemaining / 24);
        const hours = hoursRemaining % 24;
        // If we're exactly on a day boundary, show total hours to avoid "2d 0h"
        if (hours === 0) {
          setTimeString(`${hoursRemaining}h`);
        } else {
          setTimeString(`${days}d ${hours}h`);
        }
      } else {
        setTimeString(`${hoursRemaining}h`);
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [hoursRemaining]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '16px',
        right: '70px',
        zIndex: 110,
      }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          background: isCritical 
            ? 'rgba(180, 100, 100, 0.15)'
            : 'rgba(100, 100, 120, 0.1)',
          border: isCritical
            ? '1px solid rgba(180, 100, 100, 0.25)'
            : '1px solid rgba(100, 100, 120, 0.15)',
          borderRadius: '8px',
          padding: expanded ? '12px 14px' : '7px 10px',
          cursor: 'pointer',
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          minWidth: expanded ? '220px' : 'auto',
        }}
      >
        {/* Collapsed View */}
        {!expanded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                color: '#888',
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.3px',
              }}
            >
              Trial
            </span>
            <span
              style={{
                color: '#999',
                fontSize: '11px',
                fontWeight: '400',
              }}
            >
              {timeString}
            </span>
          </div>
        )}

        {/* Expanded View */}
        {expanded && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  color: '#888',
                  fontSize: '11px',
                  fontWeight: '500',
                  letterSpacing: '0.3px',
                }}
              >
                Trial Period
              </span>
              <span
                style={{
                  background: 'rgba(100, 100, 120, 0.1)',
                  color: '#888',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: '500',
                  border: '1px solid rgba(100, 100, 120, 0.15)',
                }}
              >
                {timeString}
              </span>
            </div>
            {hasMessageLimits && (
              <>
                <p
                  style={{
                    color: '#888',
                    fontSize: '11px',
                    marginBottom: '8px',
                  }}
                >
                  {messagesUsed} of {totalMessages} messages
                </p>

                {/* Progress Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(100, 100, 120, 0.1)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: 'rgba(139, 92, 246, 0.3)',
                      borderRadius: '6px',
                      width: `${progressPercent}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </>
            )}

            {/* Upgrade Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpgrade();
              }}
              style={{
                width: '100%',
                padding: '6px 12px',
                background: 'rgba(139, 92, 246, 0.2)',
                color: '#888',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
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
        )}
      </div>
    </div>
  );
}
