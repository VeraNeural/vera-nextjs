'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BreathingOrb from '../orb/BreathingOrb';
import { useAuth } from '@/hooks/useAuth';
import { AMBIENT_SOUNDS } from '@/lib/sounds/ambient-sounds';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  onNewChat?: () => void;
}

const STATUS_MESSAGES = [
  'Present with you...',
  'Holding space for you...',
  'Here in this moment...',
  'Witnessing your journey...',
  'Walking alongside you...',
  'Listening deeply...',
  'Creating space for healing...',
];


export default function Header({ onMenuToggle, showMenuButton = true, onNewChat }: HeaderProps) {
  const [statusIndex, setStatusIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [audioContext, setAudioContext] = useState<HTMLAudioElement | null>(null);
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);
  const [canPlayAudio, setCanPlayAudio] = useState(false); // requires user interaction
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Rotate status messages every 4 seconds
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Load sound preference and last sound index
    const savedSound = localStorage.getItem('vera-sound-enabled');
    const savedIndex = localStorage.getItem('vera-sound-index');
    setSoundEnabled(savedSound === 'true');
    if (savedIndex) {
      setCurrentSoundIndex(parseInt(savedIndex));
    }
  }, []);

  // Detect first user interaction to permit audio playback (autoplay policies)
  useEffect(() => {
    if (canPlayAudio) return;
    const enable = () => setCanPlayAudio(true);
    window.addEventListener('pointerdown', enable, { once: true });
    window.addEventListener('keydown', enable, { once: true });
    return () => {
      window.removeEventListener('pointerdown', enable as any);
      window.removeEventListener('keydown', enable as any);
    };
  }, [canPlayAudio]);

  // Manage ambient sound playback (supports cycling between tracks)
  useEffect(() => {
    // Only start audio after a user gesture
    if (!soundEnabled) {
      if (audioContext) {
        audioContext.pause();
        audioContext.src = '';
        setAudioContext(null);
      }
      return;
    }

    if (soundEnabled && !canPlayAudio) {
      // Defer playback until user interacts
      console.log('Audio will start after first user interaction');
      return;
    }

    if (soundEnabled && canPlayAudio) {
      const selected = AMBIENT_SOUNDS[currentSoundIndex % AMBIENT_SOUNDS.length];

      // Stop any existing audio first
      if (audioContext) {
        try {
          // quick fade out
          const step = 0.05;
          const fade = setInterval(() => {
            if (!audioContext) return clearInterval(fade);
            audioContext.volume = Math.max(0, audioContext.volume - step);
            if (audioContext.volume <= 0.05) {
              clearInterval(fade);
              audioContext.pause();
              audioContext.src = '';
            }
          }, 30);
        } catch {}
      }

      // Create new audio element
      const audio = new Audio();
      audio.src = selected.file; // Local file path from public/sounds
      audio.onerror = () => {
        console.log(`Sound not found: ${selected.file}. Add audio files to public/sounds/`);
      };
      audio.loop = true;
      audio.volume = 0.0; // start silent then fade-in
      audio.crossOrigin = 'anonymous';

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // fade in smoothly
            const target = 0.25;
            const step = 0.025;
            const fadeIn = setInterval(() => {
              audio.volume = Math.min(target, audio.volume + step);
              if (audio.volume >= target) clearInterval(fadeIn);
            }, 50);
            console.log(`Playing ambient: ${selected.name}`);
          })
          .catch((err) => {
            console.log('Audio play error:', err);
          });
      }

      setAudioContext(audio);

      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [soundEnabled, canPlayAudio, currentSoundIndex]);

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('vera-sound-enabled', String(newState));
  };

  const cycleAmbientSound = () => {
    const nextIndex = (currentSoundIndex + 1) % AMBIENT_SOUNDS.length;
    setCurrentSoundIndex(nextIndex);
    localStorage.setItem('vera-sound-index', String(nextIndex));
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const changeTheme = (theme: 'light' | 'dark' | 'deep') => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vera-theme', theme);
    setShowMenu(false);
  };

  return (
    <>
      {/* Header - Frozen at top */}
      <header
        style={{
          position: 'relative',
          zIndex: 100,
          background: 'var(--header-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 20px',
          display: 'grid',
          gridTemplateColumns: '60px 1fr auto',
          alignItems: 'center',
          gap: '16px',
          flexShrink: 0,
        }}
      >
        {/* Left: Hamburger Menu */}
        {showMenuButton && (
          <button
            onClick={onMenuToggle}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label="Menu"
          >
            <span
              style={{
                width: '24px',
                height: '2px',
                background: 'var(--text-primary)',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
              }}
            />
            <span
              style={{
                width: '24px',
                height: '2px',
                background: 'var(--text-primary)',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
              }}
            />
            <span
              style={{
                width: '24px',
                height: '2px',
                background: 'var(--text-primary)',
                borderRadius: '2px',
                transition: 'all 0.3s ease',
              }}
            />
          </button>
        )}

        {/* Center: Empty space */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
        </div>

        {/* Right: Controls */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end',
          gap: '12px',
          minWidth: '160px',
        }}>
          {/* Auth Buttons - Show when not authenticated */}
          {!authLoading && !user && (
            <>
              <button
                onClick={() => router.push('/login')}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Login
              </button>
              <button
                onClick={() => router.push('/auth/signup')}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, var(--orb-purple), var(--orb-blue))',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Start Trial
              </button>
            </>
          )}

          {/* Only show ambient sounds control when authenticated */}
          {user && (
            <button
              onClick={toggleSound}
              onContextMenu={(e) => {
                e.preventDefault();
                if (soundEnabled) {
                  cycleAmbientSound();
                }
              }}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: soundEnabled 
                  ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))' 
                  : 'transparent',
                border: soundEnabled ? '1px solid var(--orb-1)' : 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                padding: 0,
                color: soundEnabled ? 'var(--orb-1)' : 'var(--text-soft)',
                transition: 'all 0.3s ease',
              }}
              aria-label={soundEnabled ? 'Ambient sounds on' : 'Ambient sounds off'}
              title={soundEnabled 
                ? `🎵 ${AMBIENT_SOUNDS[currentSoundIndex].name}\n(Right-click to change sound)` 
                : '🌿 Enable ambient sounds'}
              onMouseEnter={(e) => {
                if (!soundEnabled) {
                  e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!soundEnabled) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {soundEnabled ? (
                // Beautiful nature/ambient icon when playing
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2C9 2 7 4 7 7c0 2.5 2 4.5 4 5c-.5.5-1 1-1 2v4h4v-4c0-1-.5-1.5-1-2c2-.5 4-2.5 4-5c0-3-2-5-5-5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity="0.3"/>
                  <path d="M12 22v-4" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 10c-2 0-3 1-3 3s1 3 3 3" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                  <path d="M16 10c2 0 3 1 3 3s-1 3-3 3" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
              ) : (
                // Muted/off nature icon
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2C9 2 7 4 7 7c0 2.5 2 4.5 4 5c-.5.5-1 1-1 2v4h4v-4c0-1-.5-1.5-1-2c2-.5 4-2.5 4-5c0-3-2-5-5-5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                  <path d="M12 22v-4" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  <line x1="4" y1="4" x2="20" y2="20" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </header>

    </>
  );
}
