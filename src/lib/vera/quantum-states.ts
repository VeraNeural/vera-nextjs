/**
 * QUANTUM STATES - Nervous System State Analysis
 * 
 * Maps the nervous system's current state using polyvagal theory
 * and quantum-like superposition of multiple states.
 */

export type QuantumState =
  | 'VENTRAL_VAGAL' // Safe & Social
  | 'SYMPATHETIC' // Fight/Flight
  | 'DORSAL_VAGAL' // Freeze/Shutdown
  | 'MIXED' // Multiple states active
  | 'TRANSITION' // Moving between states
  | 'UNKNOWN';

interface StateIndicators {
  state: QuantumState;
  keywords: string[];
  biometricRange?: {
    heartRate?: [number, number];
    hrv?: [number, number];
  };
}

const STATE_INDICATORS: StateIndicators[] = [
  {
    state: 'VENTRAL_VAGAL',
    keywords: [
      'calm',
      'connected',
      'curious',
      'open',
      'present',
      'safe',
      'grounded',
      'peaceful',
      'relaxed',
    ],
    biometricRange: {
      heartRate: [60, 80],
      hrv: [50, 100],
    },
  },
  {
    state: 'SYMPATHETIC',
    keywords: [
      'anxious',
      'worried',
      'stressed',
      'panic',
      'racing',
      'tense',
      'on edge',
      'hypervigilant',
      'activated',
      'angry',
      'rage',
    ],
    biometricRange: {
      heartRate: [90, 140],
      hrv: [20, 50],
    },
  },
  {
    state: 'DORSAL_VAGAL',
    keywords: [
      'numb',
      'disconnected',
      'empty',
      'shutdown',
      'frozen',
      'collapsed',
      'hopeless',
      'exhausted',
      'can\'t feel',
      'dissociated',
    ],
    biometricRange: {
      heartRate: [50, 65],
      hrv: [10, 30],
    },
  },
];

/**
 * Analyze the user's quantum state from their message and biometric data
 */
export function analyzeQuantumState(
  message: string,
  biometricData?: {
    heartRate?: number;
    hrv?: number;
    skinTemp?: number;
    respirationRate?: number;
  }
): string {
  const lowerMessage = message.toLowerCase();
  const detectedStates: QuantumState[] = [];

  // Check text-based indicators
  for (const indicator of STATE_INDICATORS) {
    const hasKeyword = indicator.keywords.some((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );

    if (hasKeyword) {
      detectedStates.push(indicator.state);
    }
  }

  // Check biometric data if available
  if (biometricData?.heartRate) {
    for (const indicator of STATE_INDICATORS) {
      if (indicator.biometricRange?.heartRate) {
        const [min, max] = indicator.biometricRange.heartRate;
        if (
          biometricData.heartRate >= min &&
          biometricData.heartRate <= max
        ) {
          if (!detectedStates.includes(indicator.state)) {
            detectedStates.push(indicator.state);
          }
        }
      }
    }
  }

  // Determine overall state
  if (detectedStates.length === 0) {
    return 'UNKNOWN';
  }

  if (detectedStates.length === 1) {
    return getStateDescription(detectedStates[0]);
  }

  if (detectedStates.length > 1) {
    return `MIXED (${detectedStates.join(' + ')})`;
  }

  return 'TRANSITION';
}

/**
 * Get human-readable description of a quantum state
 */
function getStateDescription(state: QuantumState): string {
  const descriptions: Record<QuantumState, string> = {
    VENTRAL_VAGAL: 'Safe & Social (Ventral Vagal)',
    SYMPATHETIC: 'Activated (Sympathetic - Fight/Flight)',
    DORSAL_VAGAL: 'Shutdown (Dorsal Vagal - Freeze)',
    MIXED: 'Multiple States Active',
    TRANSITION: 'Transitioning Between States',
    UNKNOWN: 'Unknown State',
  };

  return descriptions[state];
}

/**
 * Get regulation suggestions based on state
 */
export function getRegulationSuggestions(state: string): string[] {
  if (state.includes('SYMPATHETIC')) {
    return [
      'Long exhale breathing (4-7-8 breath)',
      'Grounding through 5 senses',
      'Progressive muscle relaxation',
      'Cold water on face (dive reflex)',
    ];
  }

  if (state.includes('DORSAL')) {
    return [
      'Gentle movement (even just wiggling toes)',
      'Humming or singing',
      'Social connection (text a friend)',
      'Self-compassion phrases',
    ];
  }

  if (state.includes('VENTRAL')) {
    return [
      'Maintain this state through awareness',
      'Connect with others',
      'Creative expression',
      'Play and curiosity',
    ];
  }

  return [
    'Notice what you\'re feeling',
    'Name the state without judgment',
    'Gentle grounding',
  ];
}
