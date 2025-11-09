// src/app/api/decode/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { detectAdaptiveCodes } from '@/lib/vera/adaptive-codes';
import { generateDecodePrompt } from '@/lib/vera/decode-mode';
import { createClient } from '@/lib/supabase/server';
import { getAccessStatus } from '@/lib/access';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔬 /api/decode - Request received at', new Date().toISOString());
    
    // Require auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Enforce subscription/trial access
    const access = await getAccessStatus(supabase as any, user.id);
    if (!access.allowed) {
      return NextResponse.json(
        {
          error: 'subscription_required',
          message: 'Your trial has ended. Please subscribe to use decode mode.',
          trialEnded: true,
        },
        { status: 403 }
      );
    }

    const { message, conversationHistory } = await request.json();
    console.log('📝 Decode message:', message?.substring(0, 50) + '...');

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // ============================================================================
    // DECODE ANALYSIS: Text-based deep analysis
    // ============================================================================

    // STEP 1: Text-based analysis
    const adaptiveCodes = detectAdaptiveCodes(message);

    // STEP 2: Generate decode prompt
    let decodePrompt = generateDecodePrompt(
      message,
      conversationHistory || [],
      adaptiveCodes
    );
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Current biometric state: ${biometricAnalysis.nervousSystemState} (${biometricAnalysis.confidence}% confidence)
Physiological indicators:
${biometricAnalysis.indicators.map(ind => `  • ${ind}`).join('\n')}
Trend: ${biometricAnalysis.trend}

IMPORTANT: Incorporate these physiological signals into your decode analysis. 
- Show how the body's signals align with (or contradict) the person's words
- Explain what the nervous system is communicating through these biomarkers
- Connect the physiological state to the adaptive patterns you're decoding

This adds a crucial layer of objective data to your pattern analysis.`;
    }

    // STEP 5: Use OpenAI for deep decode analysis
    console.log('🟠 Calling OpenAI for deep decode with', biometricAnalysis ? 'biometric enhancement' : 'text only');
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are VERA in DECODE MODE - a nervous system pattern analysis expert.

Your role: Deep, multi-layered pattern decoding using:
- Text-based adaptive codes and language patterns
- Quantum nervous system state analysis
${biometricAnalysis ? '- Real-time biometric data (heart rate, HRV, respiration, etc.)' : ''}
- Polyvagal theory and trauma-informed neuroscience

When biometric data is present, you MUST integrate it into your analysis:
- Compare what the body shows vs. what words say
- Highlight contradictions (e.g., "saying I'm fine" but HR=110, HRV=20)
- Use physiological signals to validate or challenge stated emotional states
- Show how the nervous system's truth appears in both language AND biology

Be direct, precise, and revelatory. Make the invisible visible.`,
        },
        {
          role: 'user',
          content: decodePrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500, // Increased for biometric analysis
    });

    const decodeResponse = completion.choices[0]?.message?.content || 
      'I had trouble generating the decode analysis.';

    console.log('✅ Decode complete, response length:', decodeResponse.length);

    // ============================================================================
    // RETURN ENHANCED DECODE RESPONSE
    // ============================================================================

    return NextResponse.json({
      // Core response (backward compatible)
      response: decodeResponse,
      mode: 'decode',
      
      // Pattern data
      adaptiveCodes,
      quantumState,
      
      // Enhanced: Biometric analysis (new, opt-in)
      biometricAnalysis: biometricAnalysis, // undefined if not provided
      
      // Metadata
      timestamp: new Date().toISOString(),
      analysisDepth: biometricAnalysis ? 'multi-modal' : 'text-only',
      
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('❌ Decode error at', new Date().toISOString());
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to process decode request',
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          'An error occurred',
        timestamp: new Date().toISOString(),
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}