export interface User {
  id: string;
  email: string;
  subscription_status: 'trial' | 'active' | 'canceled' | 'expired';
  trial_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface MagicLink {
  id: string;
  email: string;
  token: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: User;
  session?: Session;
}

export interface SessionValidation {
  valid: boolean;
  user?: User;
  trial?: boolean;
  trialEnd?: string;
  subscription_status?: string;
  error?: string;
  expired?: boolean;
}

export interface Trial {
  active: boolean;
  endsAt: string;
  hoursRemaining: number;
}

export interface Subscription {
  status: string;
  plan: string | null;
}