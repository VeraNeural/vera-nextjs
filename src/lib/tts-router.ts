/**
 * TTS Service Router - Intelligently choose between ElevenLabs and Hume AI
 * 
 * Strategy:
 * - Therapeutic/support content → Hume AI (expressive, emotional)
 * - Professional/informational → ElevenLabs (fast, consistent)
 * - Mixed → Hume AI first, fallback to ElevenLabs
 */

export type TTSService = 'hume' | 'elevenlabs';
export type ContentType = 'therapeutic' | 'real-talk' | 'informational' | 'mixed';

interface TTSRouterConfig {
  defaultService: TTSService;
  useFallback: boolean;
  preferredLatency: 'speed' | 'quality';
}

const DEFAULT_CONFIG: TTSRouterConfig = {
  defaultService: 'hume',
  useFallback: true,
  preferredLatency: 'quality',
};

/**
 * Analyze message content to determine appropriate TTS service
 */
export function detectContentType(text: string): ContentType {
  const lowerText = text.toLowerCase();

  // Therapeutic keywords
  const therapeuticKeywords = [
    'panic',
    'anxious',
    'scared',
    'overwhelmed',
    'trauma',
    'nervous system',
    'grounding',
    'breathing',
    'regulate',
    'dysregulated',
    'trigger',
    'flashback',
    'i\'m here',
    'support',
    'care about',
    'help you through',
  ];

  // Real Talk keywords
  const realTalkKeywords = [
    'should i',
    'what do you think',
    'advice',
    'opinion',
    'resume',
    'job',
    'career',
    'decision',
    'quick',
    'fast',
    'straight up',
  ];

  // Informational keywords
  const informationalKeywords = [
    'explain',
    'tell me about',
    'how does',
    'what is',
    'article',
    'read',
    'summarize',
    'research',
  ];

  const hasTherapeutic = therapeuticKeywords.some((kw) =>
    lowerText.includes(kw)
  );
  const hasRealTalk = realTalkKeywords.some((kw) => lowerText.includes(kw));
  const hasInformational = informationalKeywords.some((kw) =>
    lowerText.includes(kw)
  );

  if (hasTherapeutic) return 'therapeutic';
  if (hasRealTalk) return 'real-talk';
  if (hasInformational) return 'informational';
  return 'mixed';
}

/**
 * Route to appropriate TTS service based on content
 */
export function routeToTTSService(
  text: string,
  config: Partial<TTSRouterConfig> = {}
): {
  primary: TTSService;
  fallback: TTSService | null;
  contentType: ContentType;
  reason: string;
} {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const contentType = detectContentType(text);

  // Route based on content type
  let primary: TTSService;
  let reason: string;

  switch (contentType) {
    case 'therapeutic':
      primary = 'hume';
      reason = 'Therapeutic content requires emotional expressiveness';
      break;

    case 'real-talk':
      primary = finalConfig.preferredLatency === 'speed' ? 'elevenlabs' : 'hume';
      reason = finalConfig.preferredLatency === 'speed'
        ? 'Real-talk mode prefers speed'
        : 'Real-talk mode with quality focus';
      break;

    case 'informational':
      primary = 'elevenlabs';
      reason = 'Informational content benefits from consistent professional voice';
      break;

    case 'mixed':
    default:
      primary = finalConfig.defaultService;
      reason = 'Mixed/ambiguous content using default service';
  }

  const fallback =
    finalConfig.useFallback && primary === 'hume'
      ? 'elevenlabs'
      : finalConfig.useFallback && primary === 'elevenlabs'
        ? 'hume'
        : null;

  return { primary, fallback, contentType, reason };
}

/**
 * Get Hume AI expressiveness settings based on content
 */
export function getHumeExpressiveness(text: string): {
  nervousness: number;
  confidence: number;
  sentiment: number;
  urgency: number;
} {
  const lowerText = text.toLowerCase();

  // Crisis indicators → calm, confident VERA
  if (
    lowerText.includes('panic') ||
    lowerText.includes('terrified') ||
    lowerText.includes('suicidal')
  ) {
    return {
      nervousness: 5,       // VERA is very calm
      confidence: 95,       // Strong, grounded presence
      sentiment: 85,        // Warm, caring
      urgency: 5,           // Slow, spacious breathing
    };
  }

  // Anxiety/overwhelm → grounded support
  if (
    lowerText.includes('anxious') ||
    lowerText.includes('overwhelmed') ||
    lowerText.includes('can\'t')
  ) {
    return {
      nervousness: 10,
      confidence: 90,
      sentiment: 80,
      urgency: 10,
    };
  }

  // Excitement/celebration → energetic match
  if (
    lowerText.includes('excited') ||
    lowerText.includes('happy') ||
    lowerText.includes('celebrating')
  ) {
    return {
      nervousness: 30,
      confidence: 85,
      sentiment: 95,
      urgency: 60,
    };
  }

  // Uncertainty → supportive exploration
  if (
    lowerText.includes('should i') ||
    lowerText.includes('not sure') ||
    lowerText.includes('confused')
  ) {
    return {
      nervousness: 20,
      confidence: 80,
      sentiment: 70,
      urgency: 30,
    };
  }

  // Default → balanced support
  return {
    nervousness: 20,
    confidence: 80,
    sentiment: 70,
    urgency: 30,
  };
}

/**
 * Determine if text needs Hume AI specifically
 */
export function shouldUseHumeAI(text: string): boolean {
  const contentType = detectContentType(text);
  return contentType === 'therapeutic' || contentType === 'real-talk' || contentType === 'mixed';
}

/**
 * Determine if text can be handled by ElevenLabs (faster, cheaper)
 */
export function canUseElevenLabs(text: string): boolean {
  const contentType = detectContentType(text);
  return contentType === 'informational';
}
