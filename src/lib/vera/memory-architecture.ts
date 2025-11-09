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

// Re-export from types to avoid duplication
export type { UserNervousSystemProfile } from './types';
import { UserNervousSystemProfile } from './types';

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