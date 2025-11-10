'use client';

import { useState, useEffect, useRef } from 'react';

interface AudioTrack {
  name: string;
  path: string;
  id: string;
}

const AUDIO_TRACKS: AudioTrack[] = [
  { id: '1', name: 'Morning Birdlife', path: '/sounds/ES_ASMR Morning Birdlife - Autonomic Sensations.mp3' },
  { id: '2', name: 'Year of the Deer', path: '/sounds/ES_36,201 feet - Year of the Deer.mp3' },
  { id: '3', name: 'Wind', path: '/sounds/wind.mp3' },
  { id: '4', name: 'Rain', path: '/sounds/rain.mp3' },
  { id: '5', name: 'Ocean', path: '/sounds/ocean.mp3' },
  { id: '6', name: 'Night', path: '/sounds/night.mp3' },
  { id: '7', name: 'Forest', path: '/sounds/forest.mp3' },
  { id: '8', name: 'Fire', path: '/sounds/fire.mp3' },
  { id: '9', name: 'Thoughts in the Rain', path: '/sounds/ES_Thoughts in the Rain - Elm Lake.mp3' },
  { id: '10', name: 'Weatherscape', path: '/sounds/ES_Weatherscape - Fizzonaut.mp3' },
  { id: '11', name: 'Waltz of the Dead', path: '/sounds/ES_Waltz of the Dead - Mike Franklyn.mp3' },
  { id: '12', name: 'The Oak Tree', path: '/sounds/ES_The Oak Tree - Jakob Ahlbom.mp3' },
  { id: '13', name: 'Guitar Humming', path: '/sounds/guitar-humming.mp3' },
];

export default function AudioPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Handle right-click context menu
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setIsOpen(true);
      if (contextMenuRef.current) {
        contextMenuRef.current.style.top = `${e.clientY}px`;
        contextMenuRef.current.style.left = `${e.clientX}px`;
      }
    };

    const handleClick = () => {
      setIsOpen(false);
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Update audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle audio ended
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handleTimeUpdate = () => setPosition(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  const playTrack = (track: AudioTrack) => {
    if (audioRef.current) {
      audioRef.current.src = track.path;
      audioRef.current.play();
      setCurrentTrack(track);
      setIsPlaying(true);
    }
    setIsOpen(false);
  };

  const togglePlayPause = () => {
    if (!currentTrack) return;
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <audio ref={audioRef} />

      {/* Context Menu */}
      {isOpen && (
        <div
          ref={contextMenuRef}
          style={{
            position: 'fixed',
            backgroundColor: '#1a1a2e',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '8px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            zIndex: 2000,
            minWidth: '200px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '13px', fontWeight: '600' }}>
              🎵 Ambient Sounds
            </h3>
          </div>

          {/* Track List */}
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {AUDIO_TRACKS.map((track) => (
              <button
                key={track.id}
                onClick={() => playTrack(track)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: currentTrack?.id === track.id ? 'rgba(139, 92, 246, 0.25)' : 'transparent',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (currentTrack?.id !== track.id) {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTrack?.id !== track.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {currentTrack?.id === track.id && isPlaying ? '▶ ' : '○ '}
                {track.name}
              </button>
            ))}
          </div>

          {/* Player Controls */}
          {currentTrack && (
            <>
              <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(139, 92, 246, 0.2)', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                <p style={{ margin: '0 0 8px 0', color: '#8B5CF6', fontSize: '11px', fontWeight: '600' }}>
                  Now Playing: {currentTrack.name}
                </p>

                {/* Progress Bar */}
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={position}
                  onChange={(e) => {
                    if (audioRef.current) {
                      audioRef.current.currentTime = parseFloat(e.target.value);
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '4px',
                    cursor: 'pointer',
                    marginBottom: '8px',
                  }}
                />

                {/* Time Display */}
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '10px', textAlign: 'center' }}>
                  {formatTime(position)} / {formatTime(duration)}
                </div>

                {/* Button Controls */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button
                    onClick={togglePlayPause}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    {isPlaying ? '⏸ Pause' : '▶ Play'}
                  </button>
                  <button
                    onClick={stopAudio}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: 'rgba(255, 67, 67, 0.2)',
                      color: '#FF4343',
                      border: '1px solid rgba(255, 67, 67, 0.4)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    ⏹ Stop
                  </button>
                </div>

                {/* Volume Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#888' }}>🔊</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    style={{
                      flex: 1,
                      height: '3px',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{ fontSize: '10px', color: '#888', minWidth: '20px' }}>
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
