// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { detectAdaptiveCodes } from '@/lib/vera/adaptive-codes';
import { calculateQuantumState } from '@/lib/vera/quantum-states';
import { generateRealTalkPrompt, detectMode, detectModeSwitch } from '@/lib/vera/real-talk';
import { detectCrisis } from '@/lib/vera/crisis-protocol';
import OpenAI from 'openai';

// Ensure this route is always dynamic (not cached)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('💬 /api/chat - Request received at', new Date().toISOString());
    const requestData = await request.json();
    console.log('📦 Request keys:', Object.keys(requestData));
    
    const { message, imageData } = requestData;
    console.log('📝 Message:', message?.substring(0, 50) + '...');
    console.log('🖼️  ImageData present:', !!imageData, imageData ? { mimeType: imageData.mimeType, base64Length: imageData.base64?.length } : 'none');

    if (!message && !imageData) {
      console.error('❌ No message or image provided');
      return NextResponse.json(
        { error: 'Message or image is required' },
        { status: 400 }
      );
    }

    // DEVELOPMENT MODE: Skip auth for testing
    const isDev = process.env.NODE_ENV === 'development' && 
                  process.env.ALLOW_DEV_AUTH === 'true';
    
    const supabase = await createClient();
    let user = null;

    if (!isDev) {
      // Verify authentication in production
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError || !authUser) {
        return NextResponse.json(
          { error: 'Not authenticated' },
          { status: 401 }
        );
      }
      user = authUser;

      // Check trial/subscription access
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('subscription_status, trial_end, subscription_current_period_end')
        .eq('id', authUser.id)
        .single();

      if (userError) {
        console.error('Failed to fetch user data:', userError);
        return NextResponse.json(
          { error: 'Failed to verify access' },
          { status: 500 }
        );
      }

      // Check if user has active access
      const now = new Date();
      const hasActiveSubscription = 
        userData?.subscription_status === 'active' || 
        userData?.subscription_status === 'trialing';
      
      const trialValid = userData?.trial_end && new Date(userData.trial_end) > now;
      
      if (!hasActiveSubscription && !trialValid) {
        return NextResponse.json(
          { 
            error: 'subscription_required',
            message: 'Your trial has ended. Please subscribe to continue using VERA.',
            trialEnded: true 
          },
          { status: 403 }
        );
      }
    }

    // Allow image-only messages (no text)
    const hasText = typeof message === 'string' && message.trim().length > 0;
    const userText = hasText ? message : '';

    // Get conversation history (skip in dev mode if no user)
    let conversationHistory: any[] = [];
    
    if (user) {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      conversationHistory = messages?.reverse() || [];
    }

    // Check if this is a DECODE request (routes to OpenAI)
    if (needsFullDecode(message)) {
      // Route to decode API which uses OpenAI for deep analysis
      const origin = new URL(request.url).origin;
      const decodeResponse = await fetch(`${origin}/api/decode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      if (decodeResponse.ok) {
        const decodeData = await decodeResponse.json();
        
        // Save decode to database if user exists
        if (user) {
          await supabase.from('messages').insert([
            {
              user_id: user.id,
              role: 'user',
              content: message,
              created_at: new Date().toISOString(),
            },
            {
              user_id: user.id,
              role: 'assistant',
              content: decodeData.response,
              created_at: new Date().toISOString(),
            },
          ]);
        }

        return NextResponse.json(decodeData);
      }
    }
    // ============================================================================
    // ANALYSIS: Text + Mode Detection
    // ============================================================================

    // Detect mode: Real Talk vs Therapeutic
    const modeSwitch = detectModeSwitch(userText);
    const autoDetectedMode = detectMode(userText);
    const conversationMode = modeSwitch || autoDetectedMode;

    // STEP 1: Text-based analysis
    const adaptiveCodes = detectAdaptiveCodes(userText);

    // STEP 2: Calculate quantum state (text-based)
    let quantumState = calculateQuantumState(adaptiveCodes, []);    }

    // STEP 4: OpenAI deep pattern recognition (optional enhancement)
    let deepAnalysis: any = { patterns: [], emotionalState: '', recommendations: [], depth: '' };
    const openaiKeyPresent = !!process.env.OPENAI_API_KEY;
    
    if (openaiKeyPresent && hasText) {
      try {
        console.log('🟠 Calling OpenAI for deep pattern analysis...');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const analysisPrompt = `Analyze this message for deep emotional and nervous system patterns. Return JSON with:
{
  "patterns": ["list of detected adaptive survival patterns"],
  "emotionalState": "description of detected emotional/nervous system state",
  "recommendations": ["somatic responses that might help"],
  "depth": "assessment of depth/complexity"
}

Message: "${userText}"
History summary: ${conversationHistory.slice(-3).map(m => `${m.role}: ${m.content.substring(0, 50)}...`).join(' | ')}
${biometricAnalysis ? `Biometric state: ${biometricAnalysis.nervousSystemState} (${biometricAnalysis.confidence}%)` : ''}

Be precise, somatic-focused, and trauma-informed.`;

        const analysis = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert in trauma-informed nervous system analysis. Respond with valid JSON only.' },
            { role: 'user', content: analysisPrompt }
          ],
          temperature: 0.7,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        });

        const analysisText = analysis.choices[0]?.message?.content;
        if (analysisText) {
          try {
            deepAnalysis = JSON.parse(analysisText);
            console.log('🟠 OpenAI analysis complete:', deepAnalysis.patterns?.length || 0, 'patterns detected');
          } catch (parseError) {
            console.warn('⚠️  Could not parse OpenAI JSON response:', parseError);
          }
        }
      } catch (openaiError) {
        console.error('⚠️  OpenAI analysis failed:', openaiError);
        // Continue without deep analysis
      }
    }

    // STEP 5: Enrich adaptive codes with OpenAI findings
    const enrichedAdaptiveCodes = [
      ...adaptiveCodes,
      ...(deepAnalysis.patterns || []).map((pattern: string) => pattern)
    ].slice(0, 5); // Keep top 5

    // ============================================================================
    // GENERATE VERA PROMPT (Single call, reused)
    // ============================================================================

    let veraSystemPrompt: string;
    
    if (conversationMode === 'real-talk') {
      // Real Talk mode - casual, direct, practical
      veraSystemPrompt = generateRealTalkPrompt(
        hasText ? userText : 'User shared an image. Offer warm, practical observations.',
        conversationHistory
      );
    } else {
      // Therapeutic mode - nervous system co-regulation
      veraSystemPrompt = generateVERAPrompt(
        hasText ? userText : 'User shared an image. Offer gentle, observational reflections.',
        conversationHistory,
        enrichedAdaptiveCodes,
        quantumState
      );
    }

    // If biometric analysis exists, enhance the prompt
    if (biometricAnalysis) {
      veraSystemPrompt += `\n\n<biometric_context>
Current biometric state: ${biometricAnalysis.nervousSystemState} (${biometricAnalysis.confidence}% confidence)
Indicators: ${biometricAnalysis.indicators.join(', ')}
Trend: ${biometricAnalysis.trend}

Your response should acknowledge these physiological signals naturally and offer body-based support that matches their current state.
</biometric_context>`;
    }

    // If deep analysis exists, include it
    if (deepAnalysis.emotionalState) {
      veraSystemPrompt += `\n\n<deep_analysis>
Emotional state: ${deepAnalysis.emotionalState}
Detected patterns: ${deepAnalysis.patterns?.join(', ') || 'none'}
Recommendations: ${deepAnalysis.recommendations?.join(', ') || 'none'}
</deep_analysis>`;
    }

    // ============================================================================
    // BUILD CONTENT ARRAY (Text + Optional Image)
    // ============================================================================

    const contentArray: any[] = [];
    
    if (imageData) {
      console.log('📸 Adding image to request:', imageData.mimeType);
      
      // Extract base64 if it includes data URI prefix
      let base64Data = imageData.base64;
      if (typeof base64Data !== 'string') {
        console.error('❌ Base64 is not a string:', typeof base64Data);
        return NextResponse.json(
          { error: 'Invalid image data format' },
          { status: 400 }
        );
      }

      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }

      // Remove all whitespace
      base64Data = base64Data.replace(/\s/g, '');

      // Validate base64 data
      if (!base64Data || base64Data.length === 0) {
        console.error('❌ Invalid base64 data - empty after extraction');
        return NextResponse.json(
          { error: 'Invalid image data - base64 is empty' },
          { status: 400 }
        );
      }

      // Validate mime type
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const mimeType = imageData.mimeType || 'image/jpeg';
      
      if (!validMimeTypes.includes(mimeType)) {
        console.error('❌ Invalid mime type:', mimeType);
        return NextResponse.json(
          { error: `Invalid image mime type. Supported: ${validMimeTypes.join(', ')}` },
          { status: 400 }
        );
      }

      console.log('✅ Base64 data extracted, length:', base64Data.length, 'mime:', mimeType);
      
      // Add image to content array
      contentArray.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mimeType,
          data: base64Data,
        },
      });
    }
    
    // Add text content (user message or image prompt)
    contentArray.push({
      type: 'text',
      text: hasText 
        ? userText 
        : 'Please share warm, observational reflections about this image and what it might evoke for the user.',
    });

    console.log('📨 ContentArray built with', contentArray.length, 'elements');

    // ============================================================================
    // GENERATE VERA RESPONSE (Claude with fallback to OpenAI)
    // ============================================================================

    let veraResponse: string | null = null;
    const anthropicKeyPresent = !!process.env.ANTHROPIC_API_KEY;

    try {
      if (!anthropicKeyPresent) {
        throw new Error('Anthropic API key missing');
      }
      
      console.log('🔵 Calling Claude with:', {
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        contentCount: contentArray.length,
        hasImage: contentArray.some((c: any) => c.type === 'image'),
        hasBiometrics: !!biometricAnalysis,
        mode: conversationMode,
      });

      const response = await anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
        max_tokens: conversationMode === 'decode' ? 2048 : 1024,
        system: veraSystemPrompt,
        messages: [
          {
            role: 'user',
            content: contentArray,
          },
        ],
      });

      console.log('🟢 Claude response received:', {
        blocks: response.content.length,
        stopReason: response.stop_reason,
        usage: response.usage,
      });

      const block = response.content?.[0];
      if (block && block.type === 'text') {
        veraResponse = (block as any).text as string;
        console.log('✅ Response extracted successfully, length:', veraResponse.length);
      } else {
        veraResponse = 'I apologize, I had trouble generating a response.';
        console.error('❌ Unexpected response format from Claude:', block?.type);
      }
    } catch (anthropicError) {
      console.error('❌ Anthropic generation failed, attempting OpenAI fallback:', anthropicError);
      
      if (!openaiKeyPresent) {
        throw anthropicError; // no fallback available
      }
      
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // Build plain text prompt for OpenAI (doesn't support vision in this fallback)
        const textOnly = contentArray
          .map((c: any) => (c.type === 'text' ? c.text : '[Image attached - not visible in fallback mode]'))
          .join('\n');
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 800,
          messages: [
            { role: 'system', content: veraSystemPrompt },
            { role: 'user', content: textOnly },
          ],
          temperature: 0.7,
        });
        
        veraResponse = completion.choices?.[0]?.message?.content || 'I had trouble generating a response.';
        console.log('🟠 OpenAI fallback successful');
      } catch (openaiError) {
        console.error('❌ OpenAI fallback also failed:', openaiError);
        throw openaiError;
      }
    }

    // ============================================================================
    // CRISIS DETECTION (Enhanced with crisis-protocol.ts)
    // ============================================================================

    const crisisDetection = detectCrisis(userText);
    const isCrisis = crisisDetection.isCrisis;

    if (isCrisis && user) {
      console.log('🚨 CRISIS DETECTED:', crisisDetection.crisisType, `(${crisisDetection.confidence}%)`);
      await supabase.from('crisis_alerts').insert({
        user_id: user.id,
        message_content: message,
        crisis_type: crisisDetection.crisisType,
        confidence: crisisDetection.confidence,
        detected_at: new Date().toISOString(),
      });
    }

    // ============================================================================
    // SAVE TO DATABASE
    // ============================================================================

    if (user) {
      await supabase.from('messages').insert([
        {
          user_id: user.id,
          role: 'user',
          content: hasText ? userText : '[image]',
          has_image: !!imageData,
          has_biometrics: !!biometricData,
          created_at: new Date().toISOString(),
        },
        {
          user_id: user.id,
          role: 'assistant',
          content: veraResponse,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    // ============================================================================
    // RETURN ENHANCED RESPONSE
    // ============================================================================

    return NextResponse.json({
      // Core response (backward compatible)
      response: veraResponse,
      isCrisis,
      
      // Enhanced: Full pattern detection data (new, opt-in)
      detectedPatterns: {
        adaptiveCodes: enrichedAdaptiveCodes,
        quantumState: quantumState,
        quantumStateDescription: typeof quantumState === 'string' ? quantumState : quantumState.primaryState,
        biometricAnalysis: biometricAnalysis, // undefined if not sent
        deepAnalysis: deepAnalysis.patterns?.length > 0 ? deepAnalysis : undefined,
      },
      
      // Metadata
      mode: conversationMode,
      timestamp: new Date().toISOString(),
      
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
    
  } catch (error) {
    console.error('❌ Chat API error at', new Date().toISOString());
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMsg.includes('401') ? 401 : errorMsg.includes('403') ? 403 : 500;
    
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: process.env.NODE_ENV === 'development' ? errorMsg : 'An error occurred',
        timestamp: new Date().toISOString(),
      },
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}