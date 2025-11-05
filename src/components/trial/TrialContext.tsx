'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TrialState {
  messagesRemaining: number;
  totalMessages: number;
  trialEndDate: Date;
  isTrialActive: boolean;
}

interface TrialContextType extends TrialState {
  decrementMessages: () => void;
  resetTrial: () => void;
  getTimeRemaining: () => string;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

const TRIAL_MESSAGES = 50;
const TRIAL_HOURS = 48; // 48-hour trial period

export function TrialProvider({ children }: { children: ReactNode }) {
  const [trialState, setTrialState] = useState<TrialState>({
    messagesRemaining: TRIAL_MESSAGES,
    totalMessages: TRIAL_MESSAGES,
    trialEndDate: new Date(Date.now() + TRIAL_HOURS * 60 * 60 * 1000),
    isTrialActive: true,
  });

  // Load trial state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('vera_trial_state');
    if (stored) {
      const parsed = JSON.parse(stored);
      setTrialState({
        ...parsed,
        trialEndDate: new Date(parsed.trialEndDate),
      });
    } else {
      // Initialize trial for first time
      const initialState = {
        messagesRemaining: TRIAL_MESSAGES,
        totalMessages: TRIAL_MESSAGES,
        trialEndDate: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
        isTrialActive: true,
      };
      setTrialState(initialState);
      localStorage.setItem('vera_trial_state', JSON.stringify(initialState));
    }
  }, []);

  // Save trial state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('vera_trial_state', JSON.stringify(trialState));
  }, [trialState]);

  // Check if trial has expired
  useEffect(() => {
    const checkExpiry = () => {
      if (new Date() > trialState.trialEndDate && trialState.isTrialActive) {
        setTrialState(prev => ({
          ...prev,
          isTrialActive: false,
          messagesRemaining: 0,
        }));
      }
    };

    checkExpiry();
    const interval = setInterval(checkExpiry, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [trialState.trialEndDate, trialState.isTrialActive]);

  const decrementMessages = () => {
    setTrialState(prev => {
      const newRemaining = Math.max(0, prev.messagesRemaining - 1);
      return {
        ...prev,
        messagesRemaining: newRemaining,
        isTrialActive: newRemaining > 0 && new Date() < prev.trialEndDate,
      };
    });
  };

  const resetTrial = () => {
    const newState = {
      messagesRemaining: TRIAL_MESSAGES,
      totalMessages: TRIAL_MESSAGES,
      trialEndDate: new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000),
      isTrialActive: true,
    };
    setTrialState(newState);
    localStorage.setItem('vera_trial_state', JSON.stringify(newState));
  };

  const getTimeRemaining = (): string => {
    const now = new Date();
    const end = trialState.trialEndDate;
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  return (
    <TrialContext.Provider
      value={{
        ...trialState,
        decrementMessages,
        resetTrial,
        getTimeRemaining,
      }}
    >
      {children}
    </TrialContext.Provider>
  );
}

export function useTrial() {
  const context = useContext(TrialContext);
  if (context === undefined) {
    throw new Error('useTrial must be used within a TrialProvider');
  }
  return context;
}
