// Trial Types
export interface TrialState {
  messagesRemaining: number;
  totalMessages: number;
  trialEndDate: Date;
  isTrialActive: boolean;
}

export interface TrialData {
  user_id: string;
  messages_used: number;
  messages_limit: number;
  trial_start: string;
  trial_end: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
