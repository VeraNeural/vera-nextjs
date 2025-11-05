// src/hooks/useTrial.ts
'use client';

import { useState, useEffect } from 'react';
import type { TrialStatus } from '@/types/subscription';

interface UseTrialReturn {
  trial: TrialStatus | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useTrial(): UseTrialReturn {
  const [trial, setTrial] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null);

  // Fetch trial data once on mount
  const fetchTrialStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/trial/check');
      
      if (!response.ok) {
        throw new Error('Failed to fetch trial status');
      }

      const data: TrialStatus = await response.json();
      
      // Store the endsAt timestamp for client-side calculation
      setTrialEndsAt(data.endsAt);
      setTrial(data);
    } catch (err) {
      console.error('Trial check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check trial status');
      setTrial(null);
    } finally {
      setLoading(false);
    }
  };

  // Calculate hours remaining from stored timestamp
  const calculateHoursRemaining = () => {
    if (!trialEndsAt) return 48; // Default fallback

    const now = new Date();
    const endDate = new Date(trialEndsAt);
    const msRemaining = endDate.getTime() - now.getTime();
    const hoursRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)));
    
    return hoursRemaining;
  };

  // Update hours remaining every minute
  useEffect(() => {
    if (!trialEndsAt) return;

    const updateTrial = () => {
      const hoursRemaining = calculateHoursRemaining();
      
      setTrial(prev => prev ? {
        ...prev,
        hoursRemaining,
        active: hoursRemaining > 0,
      } : null);
    };

    // Update immediately
    updateTrial();

    // Then update every 60 seconds
    const interval = setInterval(updateTrial, 60 * 1000);

    return () => clearInterval(interval);
  }, [trialEndsAt]);

  // Fetch trial data once on mount, then refresh every 5 minutes
  useEffect(() => {
    fetchTrialStatus();

    // Refresh from API every 5 minutes to sync with database
    const apiRefreshInterval = setInterval(fetchTrialStatus, 5 * 60 * 1000);

    return () => clearInterval(apiRefreshInterval);
  }, []);

  return {
    trial,
    loading,
    error,
    refresh: fetchTrialStatus,
  };
}
