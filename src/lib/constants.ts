/**
 * Constants used throughout the VERA application
 */

// Trial Configuration
export const TRIAL_CONFIG = {
  MESSAGES_LIMIT: 50,
  TRIAL_DAYS: 7,
} as const;

// Subscription Plans
export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  PREMIUM: 'premium',
} as const;

// Message Limits
export const MESSAGE_LIMITS = {
  FREE: 50,
  PRO: -1, // unlimited
  PREMIUM: -1, // unlimited
} as const;

// API Endpoints
export const API_ROUTES = {
  AUTH: {
    SIGN_UP: '/api/auth/signup',
    SIGN_IN: '/api/auth/signin',
    SIGN_OUT: '/api/auth/signout',
    RESET_PASSWORD: '/api/auth/reset-password',
    UPDATE_PASSWORD: '/api/auth/update-password',
  },
  CHAT: {
    SEND_MESSAGE: '/api/chat/send',
    GET_CONVERSATIONS: '/api/chat/conversations',
    CREATE_CONVERSATION: '/api/chat/conversations/create',
    DELETE_CONVERSATION: '/api/chat/conversations/delete',
  },
  SUBSCRIPTION: {
    CREATE_CHECKOUT: '/api/subscription/checkout',
    MANAGE_BILLING: '/api/subscription/portal',
    GET_STATUS: '/api/subscription/status',
    WEBHOOK: '/api/subscription/webhook',
  },
  TRIAL: {
    GET_STATUS: '/api/trial/status',
    USE_MESSAGE: '/api/trial/use-message',
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  TRIAL_STATE: 'vera_trial_state',
  USER_PREFERENCES: 'vera_user_preferences',
  THEME: 'vera_theme',
} as const;

// Crisis Resources
export const CRISIS_HOTLINES = {
  SUICIDE_PREVENTION: '988',
  CRISIS_TEXT: '741741',
  SAMHSA: '1-800-662-4357',
  VETERANS: '988',
  TREVOR_PROJECT: '1-866-488-7386',
} as const;

// Animation Durations (in ms)
export const ANIMATIONS = {
  ORB_BREATH: 8000,
  MESSAGE_SLIDE: 400,
  TYPING_BOUNCE: 1400,
  FADE_IN: 200,
  SCALE_IN: 300,
} as const;

// Breakpoints (matches Tailwind defaults)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
