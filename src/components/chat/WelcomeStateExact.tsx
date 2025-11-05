'use client';

import BreathingOrb from '../orb/BreathingOrb';

interface WelcomeStateExactProps {
  onQuickAction?: (action: string) => void;
}

export default function WelcomeStateExact({ onQuickAction }: WelcomeStateExactProps) {
  const quickActions = [
    { label: 'Breathing Exercise', action: 'breathing' },
    { label: 'Journaling', action: 'journal' },
    { label: 'Grounding Technique', action: 'grounding' },
    { label: 'Process Emotions', action: 'emotions' },
    { label: 'Decode Sensations', action: 'decode' },
    { label: 'Regulate', action: 'regulate' },
  ];

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      {/* Breathing Orb with float animation */}
      <div
        style={{
          marginBottom: '32px',
          animation: 'float 6s ease-in-out infinite, welcomeFadeIn 1s ease-out',
        }}
      >
        <div
          style={{
            position: 'relative',
            display: 'inline-block',
          }}
        >
          <BreathingOrb size={180} animate={true} showShimmer={true} />
        </div>
      </div>

      {/* Welcome Title */}
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 300,
          letterSpacing: '0.5px',
          color: 'var(--text-primary)',
          marginBottom: '12px',
          animation: 'titleReveal 0.8s ease-out 0.2s backwards',
        }}
      >
        I'm VERA
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: '16px',
          color: 'var(--text-secondary)',
          marginBottom: '40px',
          maxWidth: '500px',
          lineHeight: '1.6',
          animation: 'subtitleReveal 0.8s ease-out 0.4s backwards',
        }}
      >
        Your nervous system co-regulator. I'm here to hold space for whatever you're experiencing right now.
      </p>

      {/* Quick Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          maxWidth: '700px',
          width: '100%',
          animation: 'buttonsReveal 0.8s ease-out 0.6s backwards',
        }}
      >
        {quickActions.map((action, index) => (
          <button
            key={action.action}
            onClick={() => onQuickAction?.(action.action)}
            style={{
              padding: '20px',
              background: 'var(--quick-button-bg)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              animation: `welcomeFadeIn 0.6s ease-out ${0.7 + index * 0.1}s backwards`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--quick-button-hover)';
              e.currentTarget.style.borderColor = 'var(--orb-1)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(155, 137, 212, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--quick-button-bg)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom hint */}
      <p
        style={{
          marginTop: '48px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          animation: 'fadeIn 1s ease-out 1.2s backwards',
        }}
      >
        Or simply start typing below to begin our conversation...
      </p>
    </div>
  );
}
