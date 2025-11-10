/**
 * SHARED TYPES v4.1
 * 
 * Common TypeScript interfaces used across all VERA modules.
 * 
 * @author VeraNeural
 * @date 2025-11-08
 */

// ============================================================================
// CORE MESSAGE TYPES
// ============================================================================

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    adaptiveCodes?: string[];
    quantumState?: string;
    mode?: 'conversational' | 'decode' | 'crisis';
  };
}

export interface VERAResponse {
  content: string;
  mode: 'conversational' | 'decode' | 'crisis';
  detectedPatterns: {
    adaptiveCodes: { code: string; intensity: number }[];
    quantumState: QuantumEmotionalState;
    quantumStateDescription: string;
    biometricAnalysis?: BiometricAnalysis;
  };
  metadata: {
    timestamp: Date;
    responseTime?: number;
    tokensUsed?: number;
    humeAI?: any;
  };
  suggestions?: {
    regulationTechniques?: string[];
    followUpPrompts?: string[];
  };
  metaLearning?: {
    interventionOffered?: string;
    shouldTrack: boolean;
  };
}

// ============================================================================
// BIOMETRIC TYPES
// ============================================================================

export interface BiometricReading {
  timestamp: Date;
  heartRate?: number;
  hrv?: number;
  respirationRate?: number;
  skinTemperature?: number;
  oxygenSaturation?: number;
  stressLevel?: number;
  sleepStage?: 'awake' | 'light' | 'deep' | 'rem';
}

export interface BiometricAnalysis {
  nervousSystemState: 'ventral' | 'sympathetic' | 'dorsal';
  confidence: number;
  indicators: string[];
  trend: 'improving' | 'stable' | 'declining';
}

// ============================================================================
// QUANTUM STATE TYPES
// ============================================================================

export interface QuantumEmotionalState {
  primaryState: 'ventral' | 'sympathetic' | 'dorsal';
  blendedStates: {
    state: 'ventral' | 'sympathetic' | 'dorsal';
    intensity: number; // 0-100
  }[];
  dominantEmotion: string;
  bodySignals: string[];
}

// ============================================================================
// USER PROFILE TYPES
// ============================================================================

export interface BiologicalMarkers {
  heartRateVariability?: number;
  restingHeartRate?: number;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  lastSleepHours?: number;
  typicalWakeTime?: string;
  typicalSleepTime?: string;
  energyPeaks?: string[];
  energyDips?: string[];
}

export interface SomaticPattern {
  pattern: string;
  triggers: string[];
  successfulInterventions: string[];
  frequency: 'rare' | 'occasional' | 'frequent' | 'constant';
  lastOccurrence?: Date;
  intensity: 1 | 2 | 3 | 4 | 5;
}

export interface AdaptiveStrategyProfile {
  strategy: string;
  activeSince?: Date;
  triggers: string[];
  protectiveFunction: string;
  cost: string;
  evolutionNotes: string;
}

export interface MetaLearningFeedback {
  timestamp: Date;
  intervention: string;
  userResponse: 'positive' | 'neutral' | 'negative' | 'no_response';
  effectiveness: number; // 0-100
  notes: string;
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
  
  biologicalMarkers?: BiologicalMarkers;
  somaticPatterns: SomaticPattern[];
  adaptiveStrategies: AdaptiveStrategyProfile[];
  
  memory: string;
  context: string;
  relationshipStart: Date;
  
  metaLearning: {
    interventionHistory: MetaLearningFeedback[];
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
  recentStates: QuantumEmotionalState[];
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export interface VERASession {
  sessionId: string;
  userId: string;
  userProfile: UserNervousSystemProfile;
  conversationHistory: ConversationMessage[];
  startTime: Date;
  lastActivity: Date;
  sessionMetrics: {
    totalMessages: number;
    crisisInterventions: number;
    decodeRequests: number;
    dominantStates: string[];
    averageResponseTime: number;
  };
}

// ============================================================================
// ADAPTIVE CODE TYPES
// ============================================================================

export interface AdaptiveCode {
  name: string;
  category: 'survival_response' | 'attachment_wound' | 'shame_core' | 'activation_state';
  keywords: string[];
  bodySignatures: string[];
  neurologicalPattern: string;
  protectiveFunction: string;
  relationalImpact: string;
}

// ============================================================================
// DECODE MODE TYPES
// ============================================================================

export interface DecodeRequestAnalysis {
  isDecodeRequest: boolean;
  needsFullDecode: boolean;
  decodeType: 'behavior' | 'relationship' | 'pattern' | 'reaction' | 'general';
  confidence: number;
  detectedSubject?: string;
}

export interface DecodeAnalysis {
  surfaceBehavior: string;
  underlyingPattern: string;
  nervousSystemState: string;
  contradiction: { body: string; mind: string };
  coreNeed: string;
  whyItMakesSense: string;
  cycle: string[];
  adaptiveCodesInvolved: string[];
  quantumState: QuantumEmotionalState;
  relationalImpact?: string;
  predictedNextSteps?: string[];
}

// ============================================================================
// CRISIS PROTOCOL TYPES
// ============================================================================

export interface CrisisDetection {
  isCrisis: boolean;
  crisisType?: 'suicidal' | 'self_harm' | 'harm_others' | 'immediate_danger';
  confidence: number;
  triggerPhrases: string[];
}