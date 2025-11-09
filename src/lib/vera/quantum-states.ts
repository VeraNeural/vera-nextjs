/**
 * QUANTUM STATES v4.1
 * 
 * Nervous system state modeling with polyvagal theory.
 */

export interface QuantumEmotionalState {
  primaryState: 'ventral' | 'sympathetic' | 'dorsal';
  blendedStates: { state: 'ventral' | 'sympathetic' | 'dorsal'; intensity: number }[];
  dominantEmotion: string;
  bodySignals: string[];
}

export function calculateQuantumState(
  adaptiveCodes: { code: string; intensity: number }[],
  conversationHistory: any[]
): QuantumEmotionalState {
  const sympatheticCodes = ['HYPERVIGILANCE', 'ANXIETY_SPIRAL', 'RAGE_DEFENSE'];
  const dorsalCodes = ['DISSOCIATION', 'COLLAPSE', 'UNWORTHINESS_CORE'];

  const sympatheticIntensity = adaptiveCodes
    .filter((c) => sympatheticCodes.includes(c.code))
    .reduce((sum, c) => sum + c.intensity, 0);

  const dorsalIntensity = adaptiveCodes
    .filter((c) => dorsalCodes.includes(c.code))
    .reduce((sum, c) => sum + c.intensity, 0);

  let state: QuantumEmotionalState = {
    primaryState: 'ventral',
    blendedStates: [],
    dominantEmotion: 'neutral',
    bodySignals: [],
  };

  if (sympatheticIntensity > 150) {
    state.primaryState = 'sympathetic';
    if (dorsalIntensity > 100) {
      state.blendedStates.push({ state: 'dorsal', intensity: Math.min(dorsalIntensity, 100) });
    }
  } else if (dorsalIntensity > 150) {
    state.primaryState = 'dorsal';
    if (sympatheticIntensity > 100) {
      state.blendedStates.push({ state: 'sympathetic', intensity: Math.min(sympatheticIntensity, 100) });
    }
  } else {
    state.primaryState = 'ventral';
  }

  return state;
}

export function getRegulationSuggestions(state: string): string[] {
  if (state.includes('SYMPATHETIC') || state.includes('sympathetic')) {
    return [
      'Long exhale breathing (4-7-8)',
      'Grounding through 5 senses',
      'Cold water on face',
    ];
  }

  if (state.includes('DORSAL') || state.includes('dorsal')) {
    return [
      'Gentle movement',
      'Humming or singing',
      'Social connection',
    ];
  }

  return ['Notice what you\'re feeling', 'Gentle grounding'];
}