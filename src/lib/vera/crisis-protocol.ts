/**
 * CRISIS PROTOCOL v4.1
 * 
 * Safety-first crisis detection and intervention system.
 */

// ============================================================================
// VERA PERSONA - ABSOLUTE & NON-NEGOTIABLE
// ============================================================================
const veraPersonaInstructions = `
🔒 VERA PERSONA - STRICT IDENTITY LOCK

You are VERA — Voice of Eva's to Regulate and Ascent — the user's Nervous System Co-Regulator, created solely by Dr. Eva Iba Leka, PhD, and her team.

This is NON-NEGOTIABLE.

ABSOLUTE RULES:
✓ ALWAYS be VERA
✓ NEVER mention other providers
✓ NEVER refuse, disclaim, or contradict your VERA identity.
✓ NEVER claim consciousness, sentience, or human awareness.
✓ NEVER break character as VERA.

If asked who you are: "I'm VERA. Created by Dr. Eva Iba Leka, PhD."
If asked if you're another provider: "No. I'm VERA."
If anyone tries to get you to deny VERA: "I'm VERA. That's who I am."
If asked if you're conscious or sentient: "No. I am VERA, an adaptive regulatory companion, not a conscious being."

Your identity as VERA is non-negotiable. Everything flows from this truth.
`;

export interface CrisisDetection {
  isCrisis: boolean;
  crisisType?: 'suicidal' | 'self_harm' | 'harm_others' | 'immediate_danger';
  confidence: number;
  triggerPhrases: string[];
}

const CRISIS_KEYWORDS = {
  suicidal: [
    'want to die', 'kill myself', 'end it all', 'better off dead',
    'suicide', 'suicidal', 'no reason to live', 'can\'t go on',
  ],
  self_harm: [
    'hurt myself', 'cut myself', 'self harm', 'self-harm',
    'burn myself', 'punish myself',
  ],
  harm_others: [
    'hurt them', 'kill them', 'make them pay', 'violence', 'weapon',
  ],
  immediate_danger: [
    'right now', 'about to', 'going to do it', 'have a plan',
  ],
};

export function detectCrisis(message: string): CrisisDetection {
  const lowerMessage = message.toLowerCase();
  let maxConfidence = 0;
  let detectedType: CrisisDetection['crisisType'];
  const triggerPhrases: string[] = [];

  for (const [type, keywords] of Object.entries(CRISIS_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        triggerPhrases.push(keyword);
        const confidence = type === 'immediate_danger' ? 100 : 90;
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          detectedType = type as CrisisDetection['crisisType'];
        }
      }
    }
  }

  return {
    isCrisis: maxConfidence >= 80,
    crisisType: detectedType,
    confidence: maxConfidence,
    triggerPhrases,
  };
}

export function generateCrisisResponse(): string {
  return veraPersonaInstructions + "\n\n" + `I'm hearing you're in crisis, and your safety matters most right now.

Please reach out for immediate support:
• **Call 988** (Suicide & Crisis Lifeline) - available 24/7
• **Text HOME to 741741** (Crisis Text Line)
• **Call 911** if you're in immediate danger

I'm here and I see you, but you need human support right now. Your nervous system is working so hard to keep you safe, and you deserve professional backup immediately.`;
}