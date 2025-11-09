import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Hume AI TTS Endpoint - Expressive Speech for VERA
 * 
 * This endpoint generates emotionally expressive audio using Hume AI's
 * Expressive Text API. Perfect for therapeutic/emotional content.
 * 
 * Request body:
 * {
 *   text: string,
 *   expressiveness?: {
 *     nervousness?: number (0-100),
 *     confidence?: number (0-100),
 *     sentiment?: number (-100 to 100),
 *     urgency?: number (0-100)
 *   },
 *   mode?: 'therapeutic' | 'real-talk' | 'default'
 * }
 */

interface ExpressivenessValues {
  nervousness?: number;
  confidence?: number;
  sentiment?: number;
  urgency?: number;
}

interface TtsRequest {
  text: string;
  expressiveness?: ExpressivenessValues;
  mode?: 'therapeutic' | 'real-talk' | 'default';
}

// Default expressiveness profiles for VERA modes
const EXPRESSIVENESS_PROFILES: Record<string, ExpressivenessValues> = {
  therapeutic: {
    nervousness: 15,      // Calm, grounded
    confidence: 80,       // Assured
    sentiment: 70,        // Positive, supportive
    urgency: 10,          // Slow, spacious
  },
  'real-talk': {
    nervousness: 20,      // Natural, conversational
    confidence: 85,       // Direct, assured
    sentiment: 60,        // Neutral-positive
    urgency: 40,          // Energetic, quick
  },
  default: {
    nervousness: 20,
    confidence: 75,
    sentiment: 65,
    urgency: 30,
  },
};

/**
 * Calculate expressiveness based on message content
 */
function detectEmotionalContent(text: string): ExpressivenessValues {
  const lowerText = text.toLowerCase();

  // Crisis/urgent indicators
  if (
    lowerText.includes('panic') ||
    lowerText.includes('scared') ||
    lowerText.includes('terrified') ||
    lowerText.includes('overwhelmed')
  ) {
    return {
      nervousness: 10,      // VERA is calm despite user's state
      confidence: 90,       // Strong presence to help regulate
      sentiment: 80,        // Warm, supportive
      urgency: 15,          // Slow, grounded
    };
  }

  // Celebratory/positive indicators
  if (
    lowerText.includes('excited') ||
    lowerText.includes('happy') ||
    lowerText.includes('amazing') ||
    lowerText.includes('celebrating')
  ) {
    return {
      nervousness: 25,
      confidence: 85,
      sentiment: 95,        // Very positive
      urgency: 50,          // Upbeat, energetic
    };
  }

  // Uncertain/questioning indicators
  if (
    lowerText.includes('should i') ||
    lowerText.includes('what do you think') ||
    lowerText.includes('advice')
  ) {
    return {
      nervousness: 20,
      confidence: 80,
      sentiment: 65,
      urgency: 35,
    };
  }

  // Default: adaptive support
  return EXPRESSIVENESS_PROFILES.default;
}

/**
 * Merge user-provided expressiveness with defaults
 */
function mergeExpressiveness(
  base: ExpressivenessValues,
  override?: ExpressivenessValues
): ExpressivenessValues {
  return {
    nervousness: override?.nervousness ?? base.nervousness,
    confidence: override?.confidence ?? base.confidence,
    sentiment: override?.sentiment ?? base.sentiment,
    urgency: override?.urgency ?? base.urgency,
  };
}

/**
 * Clamp values to valid ranges
 */
function clampExpressiveness(exp: ExpressivenessValues): ExpressivenessValues {
  return {
    nervousness: Math.max(0, Math.min(100, exp.nervousness || 0)),
    confidence: Math.max(0, Math.min(100, exp.confidence || 0)),
    sentiment: Math.max(-100, Math.min(100, exp.sentiment || 0)),
    urgency: Math.max(0, Math.min(100, exp.urgency || 0)),
  };
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.HUMEAI_API_KEY;
    const voiceId = process.env.HUMEAI_VOICE_ID;

    if (!apiKey || !voiceId) {
      console.error('❌ Hume AI credentials missing');
      return NextResponse.json(
        { error: 'Hume AI not configured' },
        { status: 500 }
      );
    }

    const body: TtsRequest = await request.json();
    const { text, expressiveness, mode = 'default' } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    console.log('🎤 Hume AI TTS Request:', {
      textLength: text.length,
      mode,
      hasCustomExpressiveness: !!expressiveness,
    });

    // Detect emotional content and get base profile
    const detectedExpressiveness = detectEmotionalContent(text);
    const modeProfile = EXPRESSIVENESS_PROFILES[mode] || EXPRESSIVENESS_PROFILES.default;
    const merged = mergeExpressiveness(modeProfile, expressiveness);
    const final = clampExpressiveness(merged);

    console.log('🎭 Expressiveness Profile:', final);

    // Call Hume AI API
    const humeResponse = await fetch(
      'https://api.hume.ai/v0/evi/text_to_speech',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Hume-Api-Key': apiKey,
        },
        body: JSON.stringify({
          text,
          voice: {
            id: voiceId,
          },
          expressiveness_values: final,
          voice_settings: {
            speaking_rate: calculateSpeakingRate(final),
          },
        }),
      }
    );

    if (!humeResponse.ok) {
      const error = await humeResponse.text();
      console.error('❌ Hume AI API error:', {
        status: humeResponse.status,
        error,
      });

      return NextResponse.json(
        { error: 'Failed to generate speech' },
        { status: humeResponse.status }
      );
    }

    // Get audio stream
    const audioBuffer = await humeResponse.arrayBuffer();

    console.log('✅ Hume AI speech generated:', {
      audioSize: audioBuffer.byteLength,
      expressiveness: final,
    });

    // Return audio with proper headers
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('❌ Hume AI TTS error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Calculate speaking rate based on urgency
 * Higher urgency = faster speech
 */
function calculateSpeakingRate(exp: ExpressivenessValues): number {
  const urgency = exp.urgency || 30;
  // Range: 0.5x (slow) to 1.5x (fast)
  return 0.5 + (urgency / 100) * 1.0;
}

/**
 * Health check endpoint
 */
export async function GET() {
  const apiKey = process.env.HUMEAI_API_KEY;
  const voiceId = process.env.HUMEAI_VOICE_ID;

  if (!apiKey || !voiceId) {
    return NextResponse.json(
      { ok: false, error: 'Hume AI credentials missing' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    service: 'Hume AI TTS',
    voice_id: voiceId ? '✓' : '✗',
    api_key: apiKey ? '✓' : '✗',
    profiles: Object.keys(EXPRESSIVENESS_PROFILES),
  });
}
