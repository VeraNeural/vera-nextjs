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
  
  const progressPercent = (messagesUsed / totalMessages) * 100;
  const isCritical = hoursRemaining <= 12;

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
        background: isCritical 
          ? 'linear-gradient(135deg, #F44336 0%, #D32F2F 100%)' 
          : 'linear-gradient(135deg, #F5A623 0%, #FF9800 100%)',
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Left: Trial Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
          <span
            style={{
              color: '#fff',
              fontSize: '13px',
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
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {timeString} remaining
          </span>
        </div>
        
        <p
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
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
            height: '6px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              height: '100%',
              background: '#fff',
              borderRadius: '10px',
              width: `${progressPercent}%`,
              transition: 'width 0.3s ease',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            }}
          />
        </div>
      </div>

      {/* Right: Upgrade Button */}
      <button
        onClick={onUpgrade}
        style={{
          padding: '10px 20px',
          background: '#fff',
          color: isCritical ? '#D32F2F' : '#F5A623',
          border: 'none',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
      >
        Upgrade Now
      </button>
    </div>
  );
}
