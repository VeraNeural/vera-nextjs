// src/hooks/useAuth.ts
'use client';

import { useState, useEffect } from 'react';
import type { User, Trial, Subscription } from '@/types/auth';

interface UseAuthReturn {
  user: User | null;
  trial: Trial | null;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔐 Fetching session from /api/auth/session');
      const response = await fetch('/api/auth/session');
      console.log('🔐 Session response:', response.status, response.statusText);
      
      const data = await response.json();
      console.log('🔐 Session data:', {
        authenticated: data.authenticated,
        hasUser: !!data.user,
        hasError: !!data.error,
      });

      if (data.authenticated && data.user) {
        setUser(data.user);
        setTrial(data.trial);
        setSubscription(data.subscription);
      } else {
        setUser(null);
        setTrial(null);
        setSubscription(null);
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch session';
      setError(errorMsg);
      setUser(null);
      setTrial(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return {
    user,
    trial,
    subscription,
    loading,
    error,
    refresh: fetchSession,
  };
}
