/**
 * MEMORY ARCHITECTURE v4.1
 * 
 * Somatic memory and user profile system.
 */

export interface SomaticPattern {
  pattern: string;
  triggers: string[];
  successfulInterventions: string[];
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  lastOccurrence?: Date;
  intensity: 1 | 2 | 3 | 4 | 5;
}

export interface ConsentBoundaries {
  deepSomaticWork: boolean;
  directChallenges: boolean;
  storytellingStyle: 'direct' | 'gentle' | 'adaptive';
  memoryReference: 'frequent' | 'moderate' | 'minimal';
  vulnerabilityTolerance: 'low' | 'medium' | 'high';
  triggerWords?: string[];
  safeWords?: string[];
}

export interface UserNervousSystemProfile {
  name: string;
  pronouns?: string;
  timezone?: string;
  
  somaticPatterns: SomaticPattern[];
  adaptiveStrategies: string[];
  
  memory: string;
  context: string;
  relationshipStart: Date;
  
  metaLearning: {
    interventionHistory: any[];
    whatWorks: string[];
    whatDoesnt: string[];
    learningNotes: string;
  };
  
  vulnerabilityWindows?: {
    timeOfDay: string;
    dayOfWeek?: string;
    pattern: string;
    severity: 'mild' | 'moderate' | 'severe';
  }[];
  
  consentPreferences: ConsentBoundaries;
  recentStates: any[];
}

export function createDefaultUserProfile(name: string): UserNervousSystemProfile {
  return {
    name,
    somaticPatterns: [],
    adaptiveStrategies: [],
    memory: '',
    context: 'New user beginning their journey with VERA.',
    relationshipStart: new Date(),
    metaLearning: {
      interventionHistory: [],
      whatWorks: [],
      whatDoesnt: [],
      learningNotes: '',
    },
    consentPreferences: {
      deepSomaticWork: false,
      directChallenges: false,
      storytellingStyle: 'adaptive',
      memoryReference: 'moderate',
      vulnerabilityTolerance: 'medium',
    },
    recentStates: [],
  };
}