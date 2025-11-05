/**
 * ADAPTIVE CODES - Pattern Recognition System
 * 
 * These are the survival patterns the nervous system develops.
 * Each code is a way the body learned to stay safe.
 */

interface AdaptiveCode {
  name: string;
  keywords: string[];
  description: string;
}

const ADAPTIVE_CODES: AdaptiveCode[] = [
  {
    name: 'ABANDONMENT',
    keywords: ['alone', 'left', 'abandoned', 'nobody cares', 'forgotten', 'isolated', 'lonely'],
    description: 'Fear of being left or rejected',
  },
  {
    name: 'BETRAYAL',
    keywords: ['betrayed', 'trust', 'lied', 'deceived', 'backstabbed', 'broken trust'],
    description: 'Trust violation trauma',
  },
  {
    name: 'UNWORTHINESS',
    keywords: ['not good enough', 'worthless', 'inadequate', 'failure', 'not deserve', 'shame'],
    description: 'Core shame and inadequacy',
  },
  {
    name: 'REJECTION',
    keywords: ['rejected', 'not wanted', 'pushed away', 'excluded', 'not accepted'],
    description: 'Fear of social exclusion',
  },
  {
    name: 'CONTROL',
    keywords: ['control', 'manipulated', 'powerless', 'helpless', 'trapped', 'stuck'],
    description: 'Loss of agency and autonomy',
  },
  {
    name: 'INVISIBILITY',
    keywords: ['invisible', 'unseen', 'ignored', 'overlooked', 'unheard', 'dismissed'],
    description: 'Being unacknowledged',
  },
  {
    name: 'PERFECTIONISM',
    keywords: ['perfect', 'flawless', 'mistake', 'wrong', 'should', 'must'],
    description: 'Impossible standards for safety',
  },
  {
    name: 'PEOPLE_PLEASING',
    keywords: ['please', 'everyone happy', 'can\'t say no', 'their needs', 'accommodate'],
    description: 'Safety through others\' approval',
  },
  {
    name: 'HYPERVIGILANCE',
    keywords: ['watch', 'careful', 'guard', 'vigilant', 'threat', 'danger', 'safe'],
    description: 'Constant threat scanning',
  },
  {
    name: 'DISSOCIATION',
    keywords: ['numb', 'disconnected', 'floating', 'unreal', 'fog', 'spaced out'],
    description: 'Escape through disconnection',
  },
  {
    name: 'FAWN',
    keywords: ['fawn', 'appease', 'avoid conflict', 'keep peace', 'accommodate'],
    description: 'Safety through submission',
  },
  {
    name: 'FREEZE',
    keywords: ['frozen', 'can\'t move', 'paralyzed', 'stuck', 'immobilized'],
    description: 'Shutdown survival response',
  },
  {
    name: 'FIGHT',
    keywords: ['angry', 'rage', 'attack', 'defend', 'fight', 'aggressive'],
    description: 'Activated defense response',
  },
  {
    name: 'FLIGHT',
    keywords: ['escape', 'run', 'avoid', 'flee', 'get away', 'panic'],
    description: 'Escape survival response',
  },
  {
    name: 'GRIEF',
    keywords: ['loss', 'grief', 'mourning', 'miss', 'gone', 'death'],
    description: 'Unprocessed loss',
  },
  {
    name: 'SAFETY_SEEKING',
    keywords: ['safe', 'unsafe', 'danger', 'threat', 'scared', 'afraid'],
    description: 'Searching for safety',
  },
  {
    name: 'SELF_ABANDONMENT',
    keywords: ['ignore myself', 'don\'t matter', 'everyone else first', 'sacrifice'],
    description: 'Abandoning own needs',
  },
  {
    name: 'TOXIC_INDEPENDENCE',
    keywords: ['do it alone', 'don\'t need help', 'handle myself', 'rely on myself'],
    description: 'Refusing connection for safety',
  },
  {
    name: 'COLLAPSE',
    keywords: ['give up', 'hopeless', 'pointless', 'why bother', 'exhausted'],
    description: 'Dorsal shutdown',
  },
  {
    name: 'ANXIETY',
    keywords: ['anxious', 'worried', 'nervous', 'stressed', 'overwhelmed', 'panic'],
    description: 'Sympathetic activation',
  },
];

/**
 * Detect which adaptive codes are present in the user's message
 */
export function detectAdaptiveCodes(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const detectedCodes: string[] = [];

  for (const code of ADAPTIVE_CODES) {
    const hasKeyword = code.keywords.some((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );

    if (hasKeyword) {
      detectedCodes.push(code.name);
    }
  }

  return detectedCodes;
}

/**
 * Get description for a specific code
 */
export function getCodeDescription(codeName: string): string {
  const code = ADAPTIVE_CODES.find((c) => c.name === codeName);
  return code?.description || '';
}

/**
 * Get all codes for reference
 */
export function getAllCodes(): AdaptiveCode[] {
  return ADAPTIVE_CODES;
}
