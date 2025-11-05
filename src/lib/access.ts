// Centralized access control (trial/subscription gating)
// Returns flags that API routes can use to allow/deny access
import type { SupabaseClient } from '@supabase/supabase-js';

export type AccessStatus = {
  hasActiveSubscription: boolean;
  trialValid: boolean;
  allowed: boolean;
  trialEnded: boolean;
};

export async function getAccessStatus(
  supabase: SupabaseClient,
  userId: string
): Promise<AccessStatus> {
  // In development, allow access to simplify local iteration
  if (process.env.NODE_ENV === 'development') {
    return {
      hasActiveSubscription: true,
      trialValid: true,
      allowed: true,
      trialEnded: false,
    };
  }

  const { data: userData, error } = await supabase
    .from('users')
    .select('subscription_status, trial_end')
    .eq('id', userId)
    .single();

  if (error) {
    // Treat missing row or fetch error as no access
    return {
      hasActiveSubscription: false,
      trialValid: false,
      allowed: false,
      trialEnded: true,
    };
  }

  const now = new Date();
  const hasActiveSubscription =
    userData?.subscription_status === 'active' ||
    userData?.subscription_status === 'trialing';

  const trialValid = !!userData?.trial_end && new Date(userData.trial_end) > now;

  const allowed = hasActiveSubscription || trialValid;

  return {
    hasActiveSubscription,
    trialValid,
    allowed,
    trialEnded: !allowed,
  };
}
