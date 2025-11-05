'use client';

import { useState, useEffect } from 'react';
import BreathingOrb from '../orb/BreathingOrb';

type BreathingPhase = 'inhale' | 'hold-in' | 'exhale' | 'hold-out';

interface BreathingSessionProps {
  onComplete?: () => void;
  onClose?: () => void;
}

export default function BreathingSession({ onComplete, onClose }: BreathingSessionProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [countdown, setCountdown] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const totalCycles = 5;

  // Breathing pattern: 4-4-4-4 box breathing
  const phaseDurations: Record<BreathingPhase, number> = {
    'inhale': 4,
    'hold-in': 4,
    'exhale': 4,
    'hold-out': 4,
  };

  const phaseOrder: BreathingPhase[] = ['inhale', 'hold-in', 'exhale', 'hold-out'];

  const phaseMessages: Record<BreathingPhase, string> = {
    'inhale': 'Breathe in slowly...',
    'hold-in': 'Hold your breath...',
    'exhale': 'Breathe out gently...',
    'hold-out': 'Pause and rest...',
  };

  useEffect(() => {
    if (!isActive) return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    // Move to next phase
    const currentIndex = phaseOrder.indexOf(phase);
    const nextIndex = (currentIndex + 1) % phaseOrder.length;
    const nextPhase = phaseOrder[nextIndex];

    // If completing a full cycle
    if (nextPhase === 'inhale') {
      const newCyclesCompleted = cyclesCompleted + 1;
      setCyclesCompleted(newCyclesCompleted);

      if (newCyclesCompleted >= totalCycles) {
        setIsActive(false);
        onComplete?.();
        return;
      }
    }

    setPhase(nextPhase);
    setCountdown(phaseDurations[nextPhase]);
  }, [isActive, countdown, phase, cyclesCompleted, onComplete]);

  const handleStart = () => {
    setIsActive(true);
    setPhase('inhale');
    setCountdown(4);
    setCyclesCompleted(0);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setPhase('inhale');
    setCountdown(4);
    setCyclesCompleted(0);
  };

  const getOrbScale = () => {
    switch (phase) {
      case 'inhale':
        return 'scale-110';
      case 'hold-in':
        return 'scale-110';
      case 'exhale':
        return 'scale-100';
      case 'hold-out':
        return 'scale-100';
      default:
        return 'scale-100';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-primary p-6">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-text-tertiary hover:text-text-primary transition-colors"
          aria-label="Close breathing session"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Progress Indicator */}
      <div className="mb-8">
        <p className="text-text-secondary text-sm text-center mb-2">
          Cycle {cyclesCompleted + 1} of {totalCycles}
        </p>
        <div className="flex gap-2">
          {Array.from({ length: totalCycles }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-1 rounded-full transition-colors ${
                i < cyclesCompleted ? 'bg-orb-purple' : 'bg-bg-tertiary'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Breathing Orb */}
      <div className={`transition-transform duration-[4000ms] ease-in-out ${isActive ? getOrbScale() : ''}`}>
        <BreathingOrb size={200} animate={isActive} />
      </div>

      {/* Phase & Countdown */}
      <div className="mt-8 text-center">
        <h2 className="text-3xl font-bold text-text-primary mb-2">
          {phaseMessages[phase]}
        </h2>
        <div className="text-6xl font-bold text-orb-purple">
          {countdown}
        </div>
      </div>

      {/* Instructions */}
      {!isActive && cyclesCompleted === 0 && (
        <div className="mt-8 max-w-md text-center">
          <p className="text-text-secondary mb-4">
            Box breathing helps calm your nervous system. Follow the orb and breathe in rhythm:
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-bg-secondary p-3 rounded-lg">
              <span className="text-orb-purple font-semibold">4s</span> Inhale
            </div>
            <div className="bg-bg-secondary p-3 rounded-lg">
              <span className="text-orb-purple font-semibold">4s</span> Hold
            </div>
            <div className="bg-bg-secondary p-3 rounded-lg">
              <span className="text-orb-purple font-semibold">4s</span> Exhale
            </div>
            <div className="bg-bg-secondary p-3 rounded-lg">
              <span className="text-orb-purple font-semibold">4s</span> Hold
            </div>
          </div>
        </div>
      )}

      {/* Completion Message */}
      {!isActive && cyclesCompleted >= totalCycles && (
        <div className="mt-8 text-center">
          <p className="text-text-primary text-xl mb-2">✨ Well done!</p>
          <p className="text-text-secondary">
            You've completed {totalCycles} breathing cycles. Notice how you feel.
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="mt-8 flex gap-4">
        {!isActive ? (
          <>
            <button
              onClick={handleStart}
              className="gradient-button px-8 py-3 rounded-xl font-semibold text-white hover:scale-105 transition-transform"
            >
              {cyclesCompleted === 0 ? 'Start Session' : cyclesCompleted >= totalCycles ? 'Start Again' : 'Resume'}
            </button>
            {cyclesCompleted > 0 && cyclesCompleted < totalCycles && (
              <button
                onClick={handleReset}
                className="px-8 py-3 rounded-xl font-semibold text-text-secondary hover:text-text-primary transition-colors border border-border-color"
              >
                Reset
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handlePause}
            className="px-8 py-3 rounded-xl font-semibold text-text-primary border border-border-color hover:bg-bg-secondary transition-colors"
          >
            Pause
          </button>
        )}
      </div>
    </div>
  );
}
