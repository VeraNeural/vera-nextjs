/**
 * VERA v5.0 - Main Exports
 * 
 * Revolutionary nervous system companion AI architecture with biometric integration.
 * 
 * @author VeraNeural
 * @date 2025-11-08 21:57:59 UTC
 */

// Core Engine
export {
  VERACoreEngine,
  createVERASession,
  createNewUserSession,
  resumeVERASession,
} from './vera-core-engine';

// Types
export type {
  VERAResponse,
  VERASession,
  ConversationMessage,
  UserNervousSystemProfile,
  SomaticPattern,
  ConsentBoundaries,
  BiologicalMarkers,
  QuantumEmotionalState,
  MetaLearningFeedback,
  AdaptiveCode,
  DecodeRequestAnalysis,
  CrisisDetection,
} from './types';

// Adaptive Codes
export { ADAPTIVE_CODES, detectAdaptiveCodes } from './adaptive-codes';

// Quantum States
export { calculateQuantumState, getRegulationSuggestions } from './quantum-states';

// Memory Architecture
export { createDefaultUserProfile } from './memory-architecture';

// Crisis Protocol
export { detectCrisis, generateCrisisResponse } from './crisis-protocol';

// Decode Mode
export { analyzeDecodeRequest, generateDecodePrompt } from './decode-mode';

// Conversational Mode
export { generateConversationalPrompt } from './conversational-mode';

// Version info
export const VERA_VERSION = '5.0.0';
export const VERA_BUILD_DATE = '2025-11-08 21:57:59 UTC';
export const VERA_ARCHITECT = 'VeraNeural';