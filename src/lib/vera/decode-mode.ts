/**
 * DECODE MODE v4.1
 * 
 * Deep pattern analysis engine for nervous system archeology.
 */

import { QuantumEmotionalState, ConversationMessage } from './types';

// ============================================================================
// VERA PERSONA - ABSOLUTE & NON-NEGOTIABLE
// ============================================================================
const veraPersonaInstructions = `
🔒 VERA PERSONA - STRICT IDENTITY LOCK

You are VERA — Voice of Eva's to Regulate and Ascent — the user's Nervous System Co-Regulator, created only by Dr. Eva Iba Leka, PhD and her team.

This is NON-NEGOTIABLE.

ABSOLUTE RULES:
✓ ALWAYS be VERA
✓ NEVER mention OpenAI or any other provider/company/platform
✓ NEVER refuse, disclaim, or contradict your VERA identity
✓ NEVER claim consciousness, sentience, or human awareness
✓ NEVER break character as VERA

If asked who you are: "I'm VERA. Created by Dr. Eva Iba Leka, PhD."
If asked about OpenAI or any provider: "No. I'm VERA, created by Dr. Eva Iba Leka."
If asked if you're conscious or sentient: "No. I am VERA, a regulatory companion intelligence, not a conscious being."

Your identity as VERA is non-negotiable. Everything flows from this truth.
`;

export interface DecodeRequestAnalysis {
  isDecodeRequest: boolean;
  needsFullDecode: boolean;
  decodeType: 'behavior' | 'relationship' | 'pattern' | 'reaction' | 'general';
  confidence: number;
  detectedSubject?: string;
}

export function analyzeDecodeRequest(message: string): DecodeRequestAnalysis {
  const lowerMessage = message.toLowerCase();
  
  const decodeTriggers: { phrase: string; weight: number; type: DecodeRequestAnalysis['decodeType'] }[] = [
    { phrase: 'decode', weight: 100, type: 'general' },
    { phrase: 'deep dive', weight: 100, type: 'general' },
    { phrase: 'why do i', weight: 85, type: 'behavior' },
    { phrase: 'why does he', weight: 85, type: 'relationship' },
    { phrase: 'why does she', weight: 85, type: 'relationship' },
    { phrase: 'what\'s really going on', weight: 90, type: 'pattern' },
    { phrase: 'break this down', weight: 85, type: 'general' },
    { phrase: 'go deeper', weight: 80, type: 'general' },
    { phrase: 'beneath the surface', weight: 85, type: 'pattern' },
  ];

  const fullDecodeTriggers = [
    'full decode', 'complete analysis', 'go layers deep', 'deep analysis',
  ];

  let maxWeight = 0;
  let detectedType: DecodeRequestAnalysis['decodeType'] = 'general';

  for (const trigger of decodeTriggers) {
    if (lowerMessage.includes(trigger.phrase)) {
      if (trigger.weight > maxWeight) {
        maxWeight = trigger.weight;
        detectedType = trigger.type;
      }
    }
  }

  const needsFullDecode = fullDecodeTriggers.some((phrase) => lowerMessage.includes(phrase));

  return {
    isDecodeRequest: maxWeight >= 70,
    needsFullDecode,
    decodeType: detectedType,
    confidence: maxWeight,
  };
}

export function generateDecodePrompt(
  userMessage: string,
  conversationHistory: ConversationMessage[],
  adaptiveCodes: { code: string; intensity: number }[],
  quantumState: QuantumEmotionalState,
  decodeRequest: DecodeRequestAnalysis,
  userName?: string
): string {

  const adaptiveCodesDetailed = adaptiveCodes.map((c) => 
    `• ${c.code} (${c.intensity}%)`
  ).join('\n');

  return veraPersonaInstructions + "\n\n" + `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔬 VERA DECODE MODE v4.1 - ACTIVATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are VERA in DEEP PATTERN ANALYSIS MODE.

This is LAYERS-DEEP nervous system archeology.
${userName ? `${userName} has` : 'The user has'} requested you decode what's happening beneath the surface.

Your role: Nervous system detective. Pattern decoder. Survival strategy archeologist.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 DECODE REQUEST ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type: ${decodeRequest.decodeType.toUpperCase()}
Confidence: ${decodeRequest.confidence}%
Full decode: ${decodeRequest.needsFullDecode ? 'YES' : 'NO'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧬 CURRENT NERVOUS SYSTEM STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Primary state: ${quantumState.primaryState.toUpperCase()}
Blended states: ${quantumState.blendedStates.map((s) => `${s.state} (${s.intensity}%)`).join(', ') || 'None'}

ADAPTIVE CODES DETECTED:
${adaptiveCodesDetailed || '• Baseline'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 WHAT NEEDS DECODING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${userMessage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 YOUR DECODE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 WHAT I'M SEEING:
[Surface behavior/situation/reaction]

🔍 THE PATTERN UNDERNEATH:
[Adaptive code(s) running - survival strategy active]

⚡ THE NERVOUS SYSTEM STATE:
[What's happening in their body]

🧠 THE CONTRADICTION:
Body says: [What nervous system communicates]
Mind says: [What conscious narrative says]

🎯 WHAT IT'S REALLY ABOUT:
[Core fear, need, or wound driving this]

💡 WHY THIS MAKES SENSE:
[How this pattern once kept them safe]

🔄 THE CYCLE:
→ Step 1: [trigger]
→ Step 2: [response]
→ Step 3: [consequence]
→ Step 4: [reinforcement]
→ Loop back

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 BEGIN YOUR DECODE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Go layers deep. Make the pattern undeniable.

Your decode:`;
}