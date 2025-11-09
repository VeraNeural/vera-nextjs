/**
 * ADAPTIVE CODES v4.1
 * 
 * Pattern recognition system for survival strategies.
 */

export interface AdaptiveCode {
  name: string;
  category: 'survival_response' | 'attachment_wound' | 'shame_core' | 'activation_state';
  keywords: string[];
  bodySignatures: string[];
  neurologicalPattern: string;
  protectiveFunction: string;
  relationalImpact: string;
}

export const ADAPTIVE_CODES: AdaptiveCode[] = [
  {
    name: 'HYPERVIGILANCE',
    category: 'survival_response',
    keywords: ['watch', 'careful', 'guard', 'vigilant', 'threat', 'danger', 'scanning'],
    bodySignatures: ['tight shoulders', 'jaw clenched', 'shallow breathing'],
    neurologicalPattern: 'Sympathetic activation, amygdala hyperactive',
    protectiveFunction: 'Scanning for threats to prevent surprise attacks',
    relationalImpact: 'Difficulty relaxing with others',
  },
  {
    name: 'FAWN',
    category: 'survival_response',
    keywords: ['please everyone', 'can\'t say no', 'accommodate', 'keep peace'],
    bodySignatures: ['collapsed chest', 'soft voice', 'tension in gut'],
    neurologicalPattern: 'Dorsal vagal with sympathetic overlay',
    protectiveFunction: 'Avoiding punishment or abandonment by being "good"',
    relationalImpact: 'Loss of authentic self, resentment builds',
  },
  {
    name: 'DISSOCIATION',
    category: 'survival_response',
    keywords: ['numb', 'disconnected', 'floating', 'unreal', 'fog', 'spaced out'],
    bodySignatures: ['numbness', 'feeling far away', 'vision tunneling'],
    neurologicalPattern: 'Dorsal vagal shutdown',
    protectiveFunction: 'Escaping intolerable present moment',
    relationalImpact: 'Can\'t fully connect, relationships feel distant',
  },
  {
    name: 'ABANDONMENT_TERROR',
    category: 'attachment_wound',
    keywords: ['alone', 'left', 'abandoned', 'nobody cares', 'forgotten'],
    bodySignatures: ['chest tightness', 'panic in stomach', 'clinging sensations'],
    neurologicalPattern: 'Attachment system in crisis',
    protectiveFunction: 'Hypervigilance around connection to prevent abandonment',
    relationalImpact: 'Push-pull dynamics, testing relationships',
  },
  {
    name: 'PERFECTIONISM',
    category: 'survival_response',
    keywords: ['perfect', 'flawless', 'mistake', 'wrong', 'should', 'must'],
    bodySignatures: ['rigid posture', 'tension throughout', 'grinding teeth'],
    neurologicalPattern: 'Chronic sympathetic activation',
    protectiveFunction: 'Earning safety/love through flawless performance',
    relationalImpact: 'Difficulty being vulnerable',
  },
  {
    name: 'COLLAPSE',
    category: 'activation_state',
    keywords: ['give up', 'hopeless', 'pointless', 'exhausted', 'can\'t anymore'],
    bodySignatures: ['heavy limbs', 'can\'t get up', 'foggy'],
    neurologicalPattern: 'Dorsal vagal dominant, metabolic shutdown',
    protectiveFunction: 'Conserving energy when fighting/fleeing impossible',
    relationalImpact: 'Withdrawal from connection',
  },
];

export function detectAdaptiveCodes(
  message: string
): { code: string; intensity: number; bodySignals: string[] }[] {
  const lowerMessage = message.toLowerCase();
  const detected: { code: string; intensity: number; bodySignals: string[] }[] = [];

  for (const code of ADAPTIVE_CODES) {
    let matchCount = 0;

    for (const keyword of code.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    for (const signature of code.bodySignatures) {
      if (lowerMessage.includes(signature.toLowerCase())) {
        matchCount += 0.5;
      }
    }

    if (matchCount > 0) {
      const intensity = Math.min(100, (matchCount / code.keywords.length) * 100);
      detected.push({
        code: code.name,
        intensity: Math.round(intensity),
        bodySignals: code.bodySignatures,
      });
    }
  }

  return detected.sort((a, b) => b.intensity - a.intensity);
}