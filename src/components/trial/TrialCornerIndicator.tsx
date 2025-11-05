'use client';

import { useEffect, useState } from 'react';

interface TrialCornerIndicatorProps {
  messagesUsed: number;
  totalMessages: number;
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
  
  const progressPercent = (messagesUsed / totalMessages) * 100;
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
            ? 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)' 
            : 'linear-gradient(135deg, #F5A623 0%, #FF9800 100%)',
          borderRadius: '12px',
          padding: expanded ? '12px 16px' : '8px 12px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s ease',
          minWidth: expanded ? '240px' : 'auto',
        }}
      >
        {/* Collapsed View */}
        {!expanded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.3px',
              }}
            >
              TRIAL
            </span>
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: '11px',
                fontWeight: 500,
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
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                }}
              >
                TRIAL PERIOD
              </span>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#fff',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 600,
                }}
              >
                {timeString}
              </span>
            </div>
            
            <p
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
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
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                overflow: 'hidden',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: '#fff',
                  borderRadius: '8px',
                  width: `${progressPercent}%`,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Upgrade Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpgrade();
              }}
              style={{
                width: '100%',
                padding: '6px 12px',
                background: '#fff',
                color: isCritical ? '#D32F2F' : '#F5A623',
                border: 'none',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Upgrade Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
